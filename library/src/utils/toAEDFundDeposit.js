/**
 * Same rules as main app `toAEDFundDeposit` (cGold-android-redesign).
 * USD amounts are converted to AED using buyConversion; AED stays as-is.
 */
export function toAEDFundDeposit(val, currency, buyConversion) {
  const n = Number(val);
  if (!Number.isFinite(n)) {
    return 0;
  }
  if (String(currency).toUpperCase() === 'USD') {
    const rate = Number(buyConversion);
    if (!Number.isFinite(rate) || rate <= 0) {
      return n;
    }
    return Number((n * rate).toFixed(4));
  }
  return n;
}
