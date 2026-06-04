import axios from 'axios';
import { getConfig, requireConfig, setUserToken } from '../configStore';
import { getApiErrorMessage, isPartnerOnlyApiPath } from '../utils/apiError';
import { handleSdkSessionExpired } from '../utils/sessionAuth';
import { applyMaintenanceFromApiError } from '../utils/maintenanceMode';

const BOUNZ_USER_PATH = '/api/sdk/bounz/user';

let apiClient = null;
let requestInterceptorId = null;

function countryCodeForApi(code) {
  return String(code || '').replace(/\D/g, '');
}

export function resetApiClient() {
  apiClient = null;
  requestInterceptorId = null;
}

export function getApiClient() {
  const config = requireConfig();
  const baseURL = `${config.apiBaseUrl}${BOUNZ_USER_PATH}`;

  if (!apiClient || apiClient.defaults.baseURL !== baseURL) {
    apiClient = axios.create({
      baseURL,
      timeout: 30000,
    });

    if (requestInterceptorId != null) {
      apiClient.interceptors.request.eject(requestInterceptorId);
      requestInterceptorId = null;
    }

    requestInterceptorId = apiClient.interceptors.request.use(req => {
      const cfg = getConfig();
      if (cfg?.userToken) {
        const token = cfg.userToken.startsWith('Bearer ')
          ? cfg.userToken
          : `Bearer ${cfg.userToken}`;
        req.headers.Authorization = token;
      }
      if (cfg?.partnerCode) {
        req.headers['X-Sdk-Partner-Code'] = cfg.partnerCode;
      }
      if (cfg?.partnerKey) {
        req.headers['X-Sdk-Partner-Key'] = cfg.partnerKey;
      }
      return req;
    });

    apiClient.interceptors.response.use(
      res => res,
      async error => {
        const status = error?.response?.status;
        const reqConfig = error?.config;
        const hadUserToken = Boolean(reqConfig?.headers?.Authorization);

        if (applyMaintenanceFromApiError(error)) {
          error.sdkMaintenanceMode = true;
          error.message =
            error?.response?.data?.error ||
            'Service is under maintenance. Please try again later.';
          return Promise.reject(error);
        }

        if (
          reqConfig &&
          !isPartnerOnlyApiPath(reqConfig.url) &&
          status === 401
        ) {
          const message = getApiErrorMessage(
            error,
            'Session expired. Please connect again.',
          );
          await handleSdkSessionExpired(error);
          error.sdkSessionExpired = true;
          error.message = message;
        }

        return Promise.reject(error);
      },
    );
  }

  return apiClient;
}

/** Partner-only calls (bootstrap / register) */
function getPartnerClient() {
  const config = requireConfig();
  return getApiClient();
}

function saveTokenFromResponse(res) {
  const token = res?.data?.token;
  if (token) {
    setUserToken(token);
  }
  return res;
}

function connectPayload(data) {
  const details = data.userDetails || {};
  return {
    mobile: data.mobile,
    countryCode: countryCodeForApi(data.countryCode),
    loyaltyId: data.loyaltyId || '',
    firstName: data.firstName || details.firstName,
    lastName: data.lastName || details.lastName,
    email: data.email || details.email,
    password: data.password || details.password,
    userDetails: details,
  };
}

function memberProfilePreviewPayload(data) {
  return {
    mobile: data.mobile,
    countryCode: countryCodeForApi(data.countryCode),
    loyaltyId: data.loyaltyId || '',
  };
}

export const sdkApi = {
  /** ClubClass member_profile before link (partner auth only). */
  previewMemberProfile: data =>
    getPartnerClient().post('/member-profile/preview', memberProfilePreviewPayload(data)),

  /** Register + link + JWT in one call (preferred first screen). */
  connect: data =>
    getPartnerClient()
      .post('/connect', connectPayload(data))
      .then(saveTokenFromResponse),

  bootstrap: data =>
    getPartnerClient()
      .post('/bootstrap', {
        mobile: data.mobile,
        countryCode: countryCodeForApi(data.countryCode),
        loyaltyId: data.loyaltyId || '',
        userDetails: data.userDetails,
      })
      .then(saveTokenFromResponse),

  register: data =>
    getPartnerClient()
      .post('/register', {
        mobile: data.mobile,
        countryCode: countryCodeForApi(data.countryCode),
        loyaltyId: data.loyaltyId || '',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      .then(saveTokenFromResponse),

  getProfile: () => getApiClient().get('/profile'),

  getTradeConfig: () => getApiClient().get('/config'),

  loyaltySync: () => getApiClient().post('/loyalty/sync'),

  /** Partner auth — price + USD/AED conversion (connect screen). */
  getMarketMeta: () => getPartnerClient().get('/market/meta'),

  getMarketPrice: () => getApiClient().get('/market/price'),

  getKycStatus: () => getApiClient().get('/kyc/status'),

  getKycMeta: () => getApiClient().get('/kyc/meta'),

  startKyc: body => getApiClient().post('/kyc/start', body || {}),

  confirmKyc: (reference) =>
    getApiClient().post('/kyc/confirm', reference ? { reference } : {}),

  /** Raw Shufti payload — same as main app POST /api/kyc/kycdata */
  postKycData: (payload) => getApiClient().post('/kyc/data', payload || {}),

  /** Optional server check; UI uses client-side `quotePointsForGold` instead. */
  tradeQuote: goldGm =>
    getApiClient().post('/trade/quote', { goldGm: parseFloat(goldGm) }),

  tradeBuy: (goldGm, idempotencyKey) =>
    getApiClient().post('/trade/buy', {
      goldGm: parseFloat(goldGm),
      idempotencyKey,
    }),

  getTradeHistory: ({ page = 1, limit = 20 } = {}) =>
    getApiClient().get('/trade/history', { params: { page, limit } }),
};
