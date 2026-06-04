import { DEFAULT_MARKET_CONVERSION } from '../constants';

/** All SDK amounts are in AED. */

export function formatMoney(value, decimals = 2) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    return '0.00';
  }
  return n.toFixed(decimals);
}

export function formatAedAmount(aedAmount, decimals = 2) {
  return `AED ${formatMoney(aedAmount, decimals)}`;
}

/**
 * Market AED per gram — same as cgoldBackend admin dashboard:
 * `Number(global.buyGm || 0) * buyConversion`
 */
export function marketGoldRateAed(
  buyGm,
  buyConversion = DEFAULT_MARKET_CONVERSION,
) {
  const base = Number(buyGm) || 0;
  const mult = Number(buyConversion) || DEFAULT_MARKET_CONVERSION;
  return base * mult;
}

export function formatMarketGoldRateAed(
  buyGm,
  buyConversion = DEFAULT_MARKET_CONVERSION,
  decimals = 2,
) {
  return formatAedAmount(marketGoldRateAed(buyGm, buyConversion), decimals);
}
