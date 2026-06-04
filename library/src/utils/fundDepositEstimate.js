import { DEFAULT_MARKET_CONVERSION } from '../constants';
import { marketGoldRateAed } from './currency';

/**
 * Grams of gold purchasable with a fund amount at live buy rate (UI estimate).
 */
export function estimateGoldGramsFromFund(
  fundAmountAed,
  buyGm,
  buyConversion = DEFAULT_MARKET_CONVERSION,
) {
  const amount = Number(fundAmountAed);
  const rate = marketGoldRateAed(buyGm, buyConversion);
  if (!Number.isFinite(amount) || amount <= 0 || !rate) {
    return null;
  }
  const grams = amount / rate;
  return Math.round(grams * 100) / 100;
}
