import { emitEvent } from '../configStore';
import { watchPendingBuy } from './pendingBuyTracker';
import { unwrapApiData } from './parseApiData';

export function createBuyIdempotencyKey() {
  if (typeof global !== 'undefined' && global.crypto?.randomUUID) {
    return global.crypto.randomUUID();
  }
  return `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Notify host app (onEvent) after a buy API call.
 * Pending hedge orders emit action `placed`; immediate completion emits `executed`.
 * @param {{ success: boolean, goldGm?: number, response?: object, error?: string }} opts
 */
export function notifyBuyTransaction(opts) {
  const { success, goldGm, response, error } = opts;
  const data = unwrapApiData(response);
  const orderStatus = data?.status;
  const buyGoldId = data?.buyGoldId;

  if (success) {
    const isPending = orderStatus === 'Pending';
    const action = isPending ? 'placed' : 'executed';

    if (isPending && buyGoldId) {
      watchPendingBuy(buyGoldId);
    }

    emitEvent('buy', {
      action,
      success: true,
      goldGm: data?.quote?.goldGm ?? goldGm,
      pointsRequired: data?.quote?.pointsRequired,
      aedAmount: data?.quote?.aedAmount,
      redemptionId: data?.redemptionId,
      buyGoldId,
      lockId: data?.lockId,
      status: orderStatus,
      redemptionStatus: data?.redemptionStatus,
      pointBalance: data?.pointBalance,
      message: isPending
        ? 'Order placed successfully'
        : 'Gold purchase completed',
      data,
    });
    return;
  }

  emitEvent('error', {
    source: 'buy',
    action: 'failed',
    message: error || 'Buy failed',
    goldGm,
  });
}
