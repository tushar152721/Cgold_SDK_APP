import { emitEvent } from '../configStore';

const DEFAULT_MESSAGE =
  'ComTech Gold is temporarily unavailable for maintenance. Please try again later.';

let active = false;
let message = DEFAULT_MESSAGE;

/**
 * @param {{ enabled?: boolean, message?: string } | null | undefined} payload
 */
export function normalizeMaintenancePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { enabled: false, message: DEFAULT_MESSAGE };
  }
  return {
    enabled: Boolean(payload.enabled),
    message:
      (payload.message && String(payload.message).trim()) || DEFAULT_MESSAGE,
  };
}

/**
 * Read maintenanceMode from typical SDK API envelopes.
 * @param {unknown} resOrBody - axios response or parsed body
 */
export function extractMaintenanceFromApi(resOrBody) {
  const body = resOrBody?.data ?? resOrBody ?? {};
  const nested = body.data ?? body;
  return normalizeMaintenancePayload(
    nested?.maintenanceMode ?? body.maintenanceMode,
  );
}

export function isMaintenanceModeActive() {
  return active;
}

export function getMaintenanceMessage() {
  return message;
}

/**
 * @param {{ enabled?: boolean, message?: string }} next
 * @returns {boolean} whether active state changed
 */
export function applyMaintenanceMode(next) {
  const normalized = normalizeMaintenancePayload(next);
  const wasActive = active;
  active = normalized.enabled;
  message = normalized.message;

  if (active && !wasActive) {
    emitEvent('error', {
      source: 'maintenance',
      action: 'active',
      message,
    });
  } else if (!active && wasActive) {
    emitEvent('error', {
      source: 'maintenance',
      action: 'cleared',
    });
  }

  return active !== wasActive;
}

export function clearMaintenanceMode() {
  active = false;
  message = DEFAULT_MESSAGE;
}

export function isMaintenanceApiError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  return (
    status === 503 &&
    (data?.code === 'MAINTENANCE' ||
      Boolean(data?.maintenanceMode?.enabled) ||
      /maintenance/i.test(String(data?.error || data?.message || '')))
  );
}

/**
 * @param {unknown} err
 */
export function applyMaintenanceFromApiError(err) {
  if (!isMaintenanceApiError(err)) {
    return false;
  }
  const data = err?.response?.data ?? {};
  applyMaintenanceMode(data.maintenanceMode || { enabled: true, message: data.error });
  return true;
}
