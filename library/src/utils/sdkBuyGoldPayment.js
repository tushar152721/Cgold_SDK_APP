import { sdkApi } from '../api/client';
import {
  getGatewayForCurrency,
  isGeideaGateway,
  PAYMENT_GATEWAY,
} from './paymentGateway';
import {
  clearBuyGoldDraft,
  clearGeideaSession,
  getBuyGoldDraft,
  getGeideaSession,
  resolveGeideaSessionId,
  storeBuyGoldDraft,
  storeGeideaSession,
} from './geideaPaymentStorage';
import { normalizePaymentStatus } from './sdkOnlinePayment';

export const PAYMENT_PURPOSE = {
  FUND_DEPOSIT: 'FUND_DEPOSIT',
  BUY_GOLD: 'BUY_GOLD',
};

export function generateBuyGoldOrderId() {
  return `BG${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * Start Geidea session for buy gold (AED / Geidea gateway).
 */
export async function initiateBuyGoldPayment({
  goldGm,
  buyGmAed,
  currency,
  paymentSettings,
  paymentMethodLabel,
  orderId,
  charges,
  user,
  marketOpen,
}) {
  const gateway = getGatewayForCurrency(currency, paymentSettings);
  if (!isGeideaGateway(gateway)) {
    throw new Error(
      `${currency} online buy gold uses ${gateway}. Only Geidea (AED) is supported in the SDK.`,
    );
  }

  const grams = Number(goldGm);
  const rate = Number(buyGmAed);
  const baseAmount = Number(charges?.enteredFund ?? grams * rate);
  const totalPayable = Number(charges?.totalPayable ?? baseAmount);

  const res = await sdkApi.geideaStartPayment({
    paymentPurpose: PAYMENT_PURPOSE.BUY_GOLD,
    currency: String(currency || 'AED').toUpperCase(),
    amount: totalPayable,
    tax: [],
    orderPayload: {
      goldGm: grams,
      rate,
      amount: totalPayable,
      actualAmount: baseAmount,
      currency,
      onlineTransactionWay: paymentMethodLabel,
      transactionFee: Number(charges?.processingFee ?? 0),
      serviceFee: Number(charges?.processingFee ?? 0),
      vatFee: Number(charges?.gstFee ?? 0),
      totalCharges: Number(charges?.totalCharges ?? 0),
      originalAmount: totalPayable,
      isMarket: Boolean(marketOpen),
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
    purpose: PAYMENT_PURPOSE.BUY_GOLD,
    orderId,
    gateway: PAYMENT_GATEWAY.GEIDEA,
  });

  await storeBuyGoldDraft({
    goldGm: grams,
    rate,
    currency,
    orderId,
    paymentGateway: gateway,
    geideaSessionId: sessionId,
    charges,
    paymentMethodLabel,
    marketOpen: Boolean(marketOpen),
    baselineGold: Number(user?.goldTotal ?? 0),
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

export async function verifyGeideaBuyGoldPayment({ orderId, status = 'Captured' }) {
  const sessionId = await resolveGeideaSessionId(orderId);
  if (!sessionId) {
    throw new Error(
      'Geidea session not found. Please restart payment from Buy Gold.',
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

export async function settleSdkBuyGoldOnline({ goldPayload }) {
  const res = await sdkApi.buyGoldWithOnlinePayment(goldPayload);
  const body = res?.data;
  if (body?.success === false) {
    throw new Error(body?.error || body?.message || 'Buy gold settlement failed');
  }
  if (body?.alreadyProcessed) {
    return body;
  }
  await clearGeideaSession();
  await clearBuyGoldDraft();
  return body;
}

export async function buildBuyGoldOnlinePayload({
  verified,
  routeParams = {},
  draft,
}) {
  const storedDraft = draft || (await getBuyGoldDraft()) || {};
  const charges = storedDraft.charges || {};
  const paymentId = verified.orderId || verified.sessionId;
  const status = routeParams.status || 'Captured';

  return {
    status,
    goldGm: Number(storedDraft.goldGm ?? routeParams.goldGm),
    amount: Number(
      routeParams.originalAmount ??
        routeParams.amount ??
        charges.totalPayable ??
        0,
    ),
    actualAmount: Number(
      routeParams.actualDepositAmount ?? charges.enteredFund ?? 0,
    ),
    rate: Number(storedDraft.rate ?? routeParams.rate ?? 0),
    currency: storedDraft.currency || routeParams.currency || 'AED',
    isMarket: Boolean(storedDraft.marketOpen ?? routeParams.isMarket),
    transactionid: verified.transactionId || paymentId,
    paymentId,
    paymentVia: 'ONLINE_PAYMENT',
    onlineTransactionWay:
      routeParams.onlineTransactionWay || storedDraft.paymentMethodLabel,
    transactionFee: Number(routeParams.transactionFee ?? charges.processingFee ?? 0),
    serviceFee: Number(routeParams.serviceFee ?? charges.processingFee ?? 0),
    vatFee: Number(routeParams.vatFee ?? charges.gstFee ?? 0),
    totalCharges: Number(routeParams.totalCharges ?? charges.totalCharges ?? 0),
    originalAmount: Number(
      routeParams.originalAmount ?? charges.totalPayable ?? 0,
    ),
  };
}
