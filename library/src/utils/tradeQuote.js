import { DEFAULT_POINTS_PER_AED } from './tradeEstimate';
import { SDK_BUY_MIN_GOLD_GM } from './tradeLimits';

/**
 * Client-side quote — must match backend `pointRedemptionService.quotePointsForGold`
 * and `POST /trade/buy` (uses `global.buyGm` as AED rate per gram, not buyGm × conversion).
 */
export function quotePointsForGold(
  goldGm,
  buyGmAed,
  pointsPerAed = DEFAULT_POINTS_PER_AED,
  minGoldGm = SDK_BUY_MIN_GOLD_GM,
  maxGoldGm,
) {
  const grams = parseFloat(goldGm);
  const rate = parseFloat(buyGmAed) || 0;
  const minGm = Number(minGoldGm) > 0 ? Number(minGoldGm) : SDK_BUY_MIN_GOLD_GM;
  const maxGm = Number(maxGoldGm);
  if (!grams || grams < minGm || !rate) {
    return null;
  }
  if (maxGm > 0 && grams > maxGm) {
    return null;
  }
  const aedAmount = grams * rate;
  const points = Math.ceil(aedAmount * pointsPerAed);
  return {
    goldGm: grams,
    buyGmAed: rate,
    aedAmount: Math.round(aedAmount * 100) / 100,
    pointsRequired: String(points),
    pointsPerAed,
  };
}
