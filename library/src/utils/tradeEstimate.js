/** Matches backend POINTS_PER_AED default */
export const DEFAULT_POINTS_PER_AED = 200;

/**
 * Estimate max gold (grams) purchasable with Bounz points.
 * @param {number} buyGmAed — same rate as backend trade quote (`global.buyGm` from socket).
 */
export function estimateMaxGoldFromPoints(
  pointBalance,
  buyGmAed,
  pointsPerAed = DEFAULT_POINTS_PER_AED,
) {
  const points = Number(pointBalance) || 0;
  const rate = Number(buyGmAed) || 0;
  const ppa = Number(pointsPerAed) || DEFAULT_POINTS_PER_AED;
  if (!rate || points <= 0) {
    return null;
  }
  const maxAed = points / ppa;
  const grams = maxAed / rate;
  return Math.floor(grams * 10000) / 10000;
}
