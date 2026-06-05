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

/** Full request path for axios error config. */
export function getAxiosRequestPath(config) {
  const base = String(config?.baseURL || '').replace(/\/$/, '');
  const url = String(config?.url || '');
  if (url.startsWith('http')) {
    return url;
  }
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Only clear SDK session on 401 when the token itself is invalid/expired —
 * not when payment/Geidea returns 401 or a misconfigured gateway responds 401.
 */
export function shouldClearSessionOn401(err) {
  const status = err?.response?.status;
  if (status !== 401) {
    return false;
  }

  const data = err?.response?.data || {};
  const code = String(data.code || '');
  if (code === 'SDK_TOKEN_EXPIRED' || code === 'SDK_TOKEN_INVALID') {
    return true;
  }

  const path = getAxiosRequestPath(err?.config);
  if (path.includes('/bounz/payment') || path.includes('/paymentService/')) {
    return false;
  }

  const msg = String(data.message || data.error || '').toLowerCase();
  if (msg.includes('invalid sdk user token')) {
    return true;
  }
  if (data.source === 'geidea' || data.details) {
    return false;
  }

  return path.includes('/bounz/user');
}
