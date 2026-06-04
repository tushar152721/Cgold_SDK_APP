import { clearUserToken, emitEvent, getConfig } from '../configStore';
import { getApiErrorMessage } from './apiError';

let sessionClearInFlight = false;

/**
 * Invalid/expired SDK user JWT — clear stored token and return user to connect.
 * @param {unknown} [axiosError]
 */
export async function handleSdkSessionExpired(axiosError) {
  if (sessionClearInFlight) {
    return;
  }
  if (!getConfig()?.userToken) {
    return;
  }

  sessionClearInFlight = true;
  try {
    const message = getApiErrorMessage(
      axiosError,
      'Session expired. Please connect again.',
    );
    await clearUserToken();
    emitEvent('error', {
      source: 'session',
      action: 'expired',
      message,
      status: axiosError?.response?.status,
    });

    const ComtechGold = require('../ComtechGold').default;
    ComtechGold.resetToConnect();
  } finally {
    sessionClearInFlight = false;
  }
}
