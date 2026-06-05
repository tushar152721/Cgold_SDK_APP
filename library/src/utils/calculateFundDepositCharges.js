const METHOD_PERCENT_KEY = {
  credit_debit: 'creditCardCharge',
  google_pay: 'googlepayCharge',
  apple_pay: 'applePayCharge',
};

const METHOD_LABEL = {
  credit_debit: 'Credit/Debit',
  direct_transfer: 'Direct Transfer',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
};

/**
 * Same formula as main app Add Funds (percentage + flat currency fee, VAT on service fee).
 */
export function calculateFundDepositCharges({
  amount,
  currency = 'AED',
  paymentMethodId = 'credit_debit',
  onlineCharges = {},
}) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  const currencyCharge =
    String(currency).toUpperCase() === 'AED'
      ? Number(onlineCharges?.aedCharge) || 0
      : Number(onlineCharges?.usdCharge) || 0;

  const percentKey = METHOD_PERCENT_KEY[paymentMethodId] || 'creditCardCharge';
  const percentageCharge = Number(onlineCharges?.[percentKey]) || 0;
  const transactionChargeAmount = (numericAmount * percentageCharge) / 100;
  const serviceFee = transactionChargeAmount + currencyCharge;
  const vatFee =
    (serviceFee * (Number(onlineCharges?.vatCharge) || 0)) / 100;
  const totalCharges = serviceFee + vatFee;
  const depositableAmount = numericAmount - totalCharges;

  return {
    enteredFund: numericAmount,
    processingFee: serviceFee,
    gstFee: vatFee,
    totalPayable: depositableAmount,
    totalCharges,
    breakdown: [],
    paymentMethodLabel:
      METHOD_LABEL[paymentMethodId] || METHOD_LABEL.credit_debit,
  };
}

export function paymentMethodLabel(paymentMethodId) {
  if (!paymentMethodId) {
    return '';
  }
  return METHOD_LABEL[paymentMethodId] || 'Credit/Debit';
}
