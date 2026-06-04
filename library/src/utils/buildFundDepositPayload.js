import { toAEDFundDeposit } from './toAEDFundDeposit';

const ONLINE_METHOD_IDS = new Set([
  'credit_debit',
  'google_pay',
  'apple_pay',
]);

/**
 * Build POST body aligned with main app `/api/funddeposit` direct deposit.
 */
export function buildFundDepositPayload({
  amount,
  currency,
  buyConversion,
  paymentMethodId,
  transactionNumber,
}) {
  const isOnline = ONLINE_METHOD_IDS.has(paymentMethodId);
  const trNo = String(transactionNumber || '').trim();

  return {
    amount: toAEDFundDeposit(amount, currency, buyConversion),
    paymentID: '~',
    paymentVia: isOnline ? 'Online Deposit' : 'Direct Deposit',
    trNo,
    description: 'Deposit Fund',
    currency: currency || 'AED',
    refNo: '~',
    onlineTransactionWay: isOnline ? 'SDK Online' : 'Direct Transfer',
  };
}

export function isOnlinePaymentMethod(paymentMethodId) {
  return ONLINE_METHOD_IDS.has(paymentMethodId);
}
