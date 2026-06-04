/**
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    const msg = data.message || data.error;
    if (msg) {
      return String(msg);
    }
  }
  if (err?.sdkSessionExpired && err?.message) {
    return String(err.message);
  }
  if (err?.message && !String(err.message).includes('status code')) {
    return String(err.message);
  }
  return fallback;
}

/** @param {unknown} err */
export function isSdkSessionExpiredError(err) {
  return Boolean(err?.sdkSessionExpired);
}

/** Partner/bootstrap routes — 401 must not clear an existing user session. */
export function isPartnerOnlyApiPath(url) {
  const path = String(url || '');
  const partnerPaths = [
    '/connect',
    '/bootstrap',
    '/register',
    '/member-profile/preview',
    '/market/meta',
  ];
  return partnerPaths.some(p => path.includes(p));
}
