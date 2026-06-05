import { sdkApi } from '../api/client';
import {
  getGatewayForCurrency,
  isGeideaGateway,
  PAYMENT_GATEWAY,
} from './paymentGateway';
import {
  clearFundDepositDraft,
  clearGeideaSession,
  getGeideaSession,
  resolveGeideaSessionId,
  storeFundDepositDraft,
  storeGeideaSession,
} from './geideaPaymentStorage';

export const PAYMENT_PURPOSE = {
  FUND_DEPOSIT: 'FUND_DEPOSIT',
};

export function normalizePaymentStatus(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');
}

export function generateDepositOrderId() {
  return `DP${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * Start Geidea session for fund deposit (AED uses Geidea per server settings).
 */
export async function initiateFundDepositPayment({
  amount,
  currency,
  paymentSettings,
  paymentMethodLabel,
  orderId,
  charges,
  user,
}) {
  const gateway = getGatewayForCurrency(currency, paymentSettings);
  if (!isGeideaGateway(gateway)) {
    throw new Error(
      `${currency} online deposits use ${gateway}. Only Geidea (AED) is supported in the SDK.`,
    );
  }

  const numericAmount = Number(amount);
  const res = await sdkApi.geideaStartPayment({
    paymentPurpose: PAYMENT_PURPOSE.FUND_DEPOSIT,
    currency: String(currency || 'AED').toUpperCase(),
    amount: numericAmount,
    tax: [],
    orderPayload: {
      amount: numericAmount,
      currency,
      onlineTransactionWay: paymentMethodLabel,
      order_id: orderId,
    },
  });

  const body = res?.data || {};
  const data = body?.data || {};
  const sessionId =
    data?.sessionId || body?.sessionId || data?.request_id || null;

  if (body?.success === false || !sessionId) {
    throw new Error(
      body?.error || body?.message || 'Failed to create Geidea payment session',
    );
  }

  await storeGeideaSession({
    sessionId,
    merchantReferenceId: body?.merchantReferenceId || data?.merchantReferenceId,
    purpose: PAYMENT_PURPOSE.FUND_DEPOSIT,
    orderId,
    gateway: PAYMENT_GATEWAY.GEIDEA,
  });

  await storeFundDepositDraft({
    amount: numericAmount,
    currency,
    payableFund: charges?.totalPayable,
    orderId,
    paymentGateway: gateway,
    geideaSessionId: sessionId,
    charges,
    paymentMethodLabel,
  });

  return {
    gateway,
    sessionId,
    merchantReferenceId: body?.merchantReferenceId || data?.merchantReferenceId,
    requestId: data?.request_id || sessionId,
    url: data?.link || data?.shortUrl,
    raw: body,
  };
}

export async function verifyGeideaPayment({ orderId, status = 'Captured' }) {
  const sessionId = await resolveGeideaSessionId(orderId);
  if (!sessionId) {
    throw new Error(
      'Geidea session not found. Please restart payment from Add Funds.',
    );
  }

  const stored = await getGeideaSession();

  const res = await sdkApi.geideaVerifyPayment({
    sessionId,
    order_id: sessionId,
    merchantReferenceId: stored?.merchantReferenceId,
    paymentStatus: status,
    status,
  });

  const payload = res?.data;
  if (payload?.success === false) {
    throw new Error(
      payload?.message || payload?.error || 'Payment verification failed',
    );
  }

  const db = payload?.databaseRecord || null;
  return {
    verifiedStatus: normalizePaymentStatus(db?.status || status),
    transactionId: db?.transactionId || db?.transaction_id || orderId,
    orderId: db?.order_id || sessionId,
    sessionId,
    api: payload,
  };
}

export async function settleSdkFundDeposit({ fundPayload }) {
  const res = await sdkApi.fundDepositAutoApprove(fundPayload);
  const body = res?.data;
  if (body?.success === false) {
    throw new Error(body?.error || 'Fund deposit settlement failed');
  }
  if (body?.alreadyProcessed) {
    return body;
  }
  await clearGeideaSession();
  await clearFundDepositDraft();
  return body;
}
