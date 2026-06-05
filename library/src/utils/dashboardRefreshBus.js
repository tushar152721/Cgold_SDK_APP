/** Notify dashboard to refresh after gold balance is credited. */

let listeners = new Set();
let pendingGoldRefresh = false;

/**
 * @param {(payload: { goldGm?: number, source?: string }) => void} listener
 */
export function subscribeDashboardGoldRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDashboardGoldRefresh(payload = {}) {
  pendingGoldRefresh = true;
  listeners.forEach(listener => {
    try {
      listener(payload);
    } catch {
      /* ignore listener errors */
    }
  });
}

export function hasPendingDashboardGoldRefresh() {
  return pendingGoldRefresh;
}

export function clearPendingDashboardGoldRefresh() {
  pendingGoldRefresh = false;
}
