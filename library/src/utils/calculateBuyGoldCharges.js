const METHOD_PERCENT_KEY = {
  credit_debit: 'creditCardCharge',
  google_pay: 'googlepayCharge',
  apple_pay: 'applePayCharge',
};

const METHOD_LABEL = {
  credit_debit: 'Credit/Debit',
  my_balance: 'My Balance',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
};

/**
 * Buy-gold online charges — added on top of gold value (main app Gold screen formula).
 */
export function calculateBuyGoldCharges({
  goldGm,
  buyGmAed,
  currency = 'AED',
  paymentMethodId = 'credit_debit',
  onlineCharges = {},
}) {
  const grams = Number(goldGm);
  const rate = Number(buyGmAed);
  if (!Number.isFinite(grams) || grams <= 0 || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  const baseAmount = Number((grams * rate).toFixed(2));
  if (paymentMethodId === 'my_balance') {
    return {
      enteredFund: baseAmount,
      processingFee: 0,
      gstFee: 0,
      totalPayable: baseAmount,
      totalCharges: 0,
      paymentMethodLabel: METHOD_LABEL.my_balance,
    };
  }

  const currencyCharge =
    String(currency).toUpperCase() === 'AED'
      ? Number(onlineCharges?.aedCharge) || 0
      : Number(onlineCharges?.usdCharge) || 0;

  const percentKey = METHOD_PERCENT_KEY[paymentMethodId] || 'creditCardCharge';
  const percentageCharge = Number(onlineCharges?.[percentKey]) || 0;
  const transactionChargeAmount = (baseAmount * percentageCharge) / 100;
  const serviceFee = transactionChargeAmount + currencyCharge;
  const vatFee = (serviceFee * (Number(onlineCharges?.vatCharge) || 0)) / 100;
  const totalCharges = serviceFee + vatFee;

  return {
    enteredFund: baseAmount,
    processingFee: serviceFee,
    gstFee: vatFee,
    totalPayable: Number((baseAmount + totalCharges).toFixed(2)),
    totalCharges,
    paymentMethodLabel: METHOD_LABEL[paymentMethodId] || METHOD_LABEL.credit_debit,
  };
}

export function buyGoldPaymentMethodLabel(paymentMethodId) {
  if (!paymentMethodId) {
    return '';
  }
  return METHOD_LABEL[paymentMethodId] || 'Credit/Debit';
}

export function isOnlineBuyGoldMethod(paymentMethodId) {
  return paymentMethodId === 'credit_debit';
}
