import { emitEvent } from '../configStore';
import {
  watchPendingBuy,
  clearPendingBuyWatch,
  wasTransitionEmitted,
  markTransitionEmitted,
  isPendingBuyWatched,
  isHistoryItemProcessing,
  isHistoryItemExecuted,
  isHistoryItemRejected,
  getPendingBuyIds,
} from './pendingBuyTracker';

/**
 * @param {object} item - trade history row from API
 * @returns {{ action: 'executed'|'rejected', item: object } | null}
 */
function detectTransition(item) {
  const buyGoldId = item?.buyGoldId || item?.id;
  if (!buyGoldId) {
    return null;
  }

  // Only emit completion/failure transitions for orders this session is watching.
  if (!isPendingBuyWatched(buyGoldId)) {
    return null;
  }

  if (isHistoryItemExecuted(item)) {
    if (!wasTransitionEmitted(buyGoldId, 'executed')) {
      return { action: 'executed', item };
    }
    clearPendingBuyWatch(buyGoldId);
    return null;
  }

  if (isHistoryItemRejected(item)) {
    if (!wasTransitionEmitted(buyGoldId, 'rejected')) {
      return { action: 'rejected', item };
    }
    clearPendingBuyWatch(buyGoldId);
    return null;
  }

  return null;
}

function emitBuyTransition(action, item) {
  const buyGoldId = item?.buyGoldId || item?.id;
  markTransitionEmitted(buyGoldId, action);
  clearPendingBuyWatch(buyGoldId);

  const goldGm = item?.goldGm != null ? Number(item.goldGm) : undefined;

  emitEvent('buy', {
    action,
    success: action === 'executed',
    goldGm,
    points: item?.points,
    amountAed: item?.amountAed,
    buyGoldId,
    redemptionId: item?.redemptionId || item?.id,
    redemptionStatus: item?.status,
    buyStatus: item?.buyStatus,
    failureReason: item?.failureReason,
  });
}

/**
 * Scan history for completed/rejected orders and emit host events once.
 * @param {object[]} items
 * @returns {{ executed: object[], rejected: object[], processingCount: number }}
 */
export function processTradeHistoryForNotifications(items) {
  const list = Array.isArray(items) ? items : [];
  const executed = [];
  const rejected = [];
  let processingCount = 0;

  for (const item of list) {
    if (isHistoryItemProcessing(item)) {
      processingCount += 1;
      const buyGoldId = item?.buyGoldId || item?.id;
      if (buyGoldId) {
        watchPendingBuy(buyGoldId);
      }
    }

    const transition = detectTransition(item);
    if (!transition) {
      continue;
    }
    emitBuyTransition(transition.action, transition.item);
    if (transition.action === 'executed') {
      executed.push(transition.item);
    } else {
      rejected.push(transition.item);
    }
  }

  return { executed, rejected, processingCount };
}

export { watchPendingBuy };
