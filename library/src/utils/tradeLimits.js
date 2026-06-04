/**
 * Gold trade gram limits — aligned with cGold-android-redesign
 * (app/Screens/Gold/index.jsx and app/Components/UI/GoldExchangeCard.jsx).
 */
export const SDK_BUY_MIN_GOLD_GM = 0.02;
export const SDK_SELL_MIN_GOLD_GM = 0.5;

export function getMinGoldGmForMode(mode) {
  try {
    const { getBuyMinGoldGm, getSellMinGoldGm } = require('./tradeConfigCache');
    return mode === 'sell' ? getSellMinGoldGm() : getBuyMinGoldGm();
  } catch {
    return mode === 'sell' ? SDK_SELL_MIN_GOLD_GM : SDK_BUY_MIN_GOLD_GM;
  }
}

/** Effective max grams for buy: lower of points cap and platform Setting.max from API. */
export function getEffectiveBuyMaxGoldGm(pointsCapGoldGm) {
  try {
    const { getBuyMaxGoldGm } = require('./tradeConfigCache');
    const platformMax = getBuyMaxGoldGm();
    const pointsCap = Number(pointsCapGoldGm);
    if (platformMax != null && platformMax > 0 && pointsCap > 0) {
      return Math.min(platformMax, pointsCap);
    }
    if (platformMax != null && platformMax > 0) {
      return platformMax;
    }
    if (pointsCap > 0) {
      return pointsCap;
    }
    return null;
  } catch {
    const pointsCap = Number(pointsCapGoldGm);
    return pointsCap > 0 ? pointsCap : null;
  }
}

/**
 * @param {number} grams
 * @param {'buy'|'sell'} mode
 * @param {number} [maxGoldGm] — optional upper bound (e.g. from points balance)
 */
export function validateGoldGrams(grams, mode, maxGoldGm) {
  const minGm = getMinGoldGmForMode(mode);
  const maxGm =
    mode === 'buy' && maxGoldGm != null
      ? getEffectiveBuyMaxGoldGm(maxGoldGm) ?? maxGoldGm
      : maxGoldGm;
  const g = parseFloat(grams);
  if (!g || Number.isNaN(g)) {
    return { ok: false, message: 'Enter a valid gram amount' };
  }
  if (g < minGm) {
    return {
      ok: false,
      message: `Enter minimum ${minGm} gram gold to ${mode} gold`,
    };
  }
  const maxVal = Number(maxGm);
  if (maxVal > 0 && g > maxVal) {
    return {
      ok: false,
      message:
        mode === 'buy'
          ? `Maximum purchase is ${maxVal} grams`
          : `Maximum ${maxVal} grams`,
    };
  }
  return { ok: true, goldGm: g };
}
