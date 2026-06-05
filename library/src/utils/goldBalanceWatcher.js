/** Track pending fund/card buys until gold balance increases. */

const pendingWatches = new Map();
const toastedOrders = new Set();

/** Hedge settlement usually takes longer — avoid false toast from stale profile. */
export const GOLD_BALANCE_MIN_SETTLE_MS = 20000;

/**
 * @param {{ buyGoldId: string, baselineGold: number, goldGm: number, source?: 'balance'|'online'|'points', skipMinDelay?: boolean }} opts
 */
export function watchGoldBalanceForOrder({
  buyGoldId,
  baselineGold,
  goldGm,
  source = 'balance',
  skipMinDelay = false,
}) {
  if (buyGoldId == null || buyGoldId === '') {
    return;
  }
  const now = Date.now();
  pendingWatches.set(String(buyGoldId), {
    baselineGold: Number(baselineGold) || 0,
    goldGm: Number(goldGm) || 0,
    source: source || 'balance',
    startedAt: now,
    earliestToastAt: skipMinDelay ? now : now + GOLD_BALANCE_MIN_SETTLE_MS,
  });
}

export function getPendingGoldBalanceWatches() {
  return [...pendingWatches.entries()].map(([buyGoldId, meta]) => ({
    buyGoldId,
    ...meta,
  }));
}

export function clearGoldBalanceWatch(buyGoldId) {
  if (buyGoldId != null) {
    pendingWatches.delete(String(buyGoldId));
  }
}

export function wasGoldBalanceToasted(buyGoldId) {
  return toastedOrders.has(String(buyGoldId));
}

export function markGoldBalanceToasted(buyGoldId) {
  if (buyGoldId != null) {
    toastedOrders.add(String(buyGoldId));
  }
}

export function resetGoldBalanceWatcher() {
  pendingWatches.clear();
  toastedOrders.clear();
}

/**
 * Register a pending buy for balance polling + existing hedge tracker.
 */
export function registerPendingGoldBuy({
  buyGoldId,
  baselineGold,
  goldGm,
  source = 'balance',
  skipMinDelay = false,
}) {
  const { watchPendingBuy } = require('./pendingBuyTracker');
  if (buyGoldId) {
    watchPendingBuy(buyGoldId);
  }
  watchGoldBalanceForOrder({
    buyGoldId,
    baselineGold,
    goldGm,
    source,
    skipMinDelay,
  });
}

/** True when holdings increased by at least the expected grams (strict delta check). */
export function isGoldBalanceUpdated(baselineGold, currentGold, expectedGm) {
  const baseline = Number(baselineGold) || 0;
  const current = Number(currentGold) || 0;
  const expected = Number(expectedGm) || 0;
  const delta = current - baseline;
  if (expected <= 0) {
    return delta > 0.0005;
  }
  return delta >= expected * 0.98 - 0.0005;
}
