/** In-memory watch list for buys awaiting hedge settlement. */

const pendingBuyIds = new Set();
const emittedTransitions = new Set();

export function watchPendingBuy(buyGoldId) {
  if (buyGoldId != null && buyGoldId !== '') {
    pendingBuyIds.add(String(buyGoldId));
  }
}

export function clearPendingBuyWatch(buyGoldId) {
  if (buyGoldId != null) {
    pendingBuyIds.delete(String(buyGoldId));
  }
}

export function getPendingBuyIds() {
  return [...pendingBuyIds];
}

export function isPendingBuyWatched(buyGoldId) {
  if (buyGoldId == null || buyGoldId === '') {
    return false;
  }
  return pendingBuyIds.has(String(buyGoldId));
}

function transitionKey(buyGoldId, action) {
  return `${String(buyGoldId)}:${action}`;
}

export function wasTransitionEmitted(buyGoldId, action) {
  return emittedTransitions.has(transitionKey(buyGoldId, action));
}

export function markTransitionEmitted(buyGoldId, action) {
  emittedTransitions.add(transitionKey(buyGoldId, action));
}

export function isHistoryItemProcessing(item) {
  const redemptionStatus = String(item?.status || '').toLowerCase();
  const buyStatus = item?.buyStatus;
  return (
    redemptionStatus === 'locked' ||
    buyStatus === 'Pending' ||
    buyStatus === 'InProgress'
  );
}

export function isHistoryItemExecuted(item) {
  const redemptionStatus = String(item?.status || '').toLowerCase();
  const buyStatus = item?.buyStatus;
  return redemptionStatus === 'redeemed' || buyStatus === 'Completed';
}

export function isHistoryItemRejected(item) {
  const redemptionStatus = String(item?.status || '').toLowerCase();
  const buyStatus = item?.buyStatus;
  return (
    redemptionStatus === 'released' ||
    redemptionStatus === 'failed' ||
    buyStatus === 'Rejected'
  );
}

/** Clear watches after logout / new session. */
export function resetPendingBuyTracker() {
  pendingBuyIds.clear();
  emittedTransitions.clear();
}
