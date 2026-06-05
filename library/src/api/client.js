import axios from 'axios';
import { getConfig, requireConfig, setUserToken } from '../configStore';
import {
  getApiErrorMessage,
  isPartnerOnlyApiPath,
  shouldClearSessionOn401,
} from '../utils/apiError';
import { handleSdkSessionExpired } from '../utils/sessionAuth';
import { applyMaintenanceFromApiError } from '../utils/maintenanceMode';

const BOUNZ_USER_PATH = '/api/sdk/bounz/user';
const BOUNZ_FUND_PATH = '/api/sdk/bounz/fund';
const BOUNZ_FUND_UPDATE_PATH = '/api/sdk/bounz/fund-update';
const BOUNZ_PAYMENT_PATH = '/api/sdk/bounz/payment';

let apiClient = null;
let fundApiClient = null;
let fundUpdateApiClient = null;
let bounzPaymentApiClient = null;
let requestInterceptorId = null;
let fundRequestInterceptorId = null;
let fundUpdateInterceptorRef = { current: null };
let bounzPaymentInterceptorRef = { current: null };

function countryCodeForApi(code) {
  return String(code || '').replace(/\D/g, '');
}

export function resetApiClient() {
  apiClient = null;
  fundApiClient = null;
  fundUpdateApiClient = null;
  bounzPaymentApiClient = null;
  requestInterceptorId = null;
  fundRequestInterceptorId = null;
  fundUpdateInterceptorRef.current = null;
  bounzPaymentInterceptorRef.current = null;
}

function attachSdkAuthInterceptors(client, interceptorIdRef) {
  if (interceptorIdRef.current != null) {
    client.interceptors.request.eject(interceptorIdRef.current);
    interceptorIdRef.current = null;
  }

  interceptorIdRef.current = client.interceptors.request.use(req => {
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

  client.interceptors.response.use(
    res => res,
    async error => {
      const status = error?.response?.status;
      const reqConfig = error?.config;

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
        shouldClearSessionOn401(error)
      ) {
        const message = getApiErrorMessage(
          error,
          'Session expired. Please connect again.',
        );
        await handleSdkSessionExpired(error);
        error.sdkSessionExpired = true;
        error.message = message;
      } else if (status === 401 || status === 502) {
        error.message = getApiErrorMessage(
          error,
          status === 502
            ? 'Payment gateway error. Please try again or contact support.'
            : 'Request was not authorized.',
        );
      }

      return Promise.reject(error);
    },
  );
}

const userInterceptorRef = { current: null };
const fundInterceptorRef = { current: null };

export function getApiClient() {
  const config = requireConfig();
  const baseURL = `${config.apiBaseUrl}${BOUNZ_USER_PATH}`;

  if (!apiClient || apiClient.defaults.baseURL !== baseURL) {
    apiClient = axios.create({
      baseURL,
      timeout: 30000,
    });
    attachSdkAuthInterceptors(apiClient, userInterceptorRef);
    requestInterceptorId = userInterceptorRef.current;
  }

  return apiClient;
}

/** SDK fund deposit — mirrors main app POST /api/funddeposit via /api/sdk/bounz/fund */
export function getFundApiClient() {
  const config = requireConfig();
  const baseURL = `${config.apiBaseUrl}${BOUNZ_FUND_PATH}`;

  if (!fundApiClient || fundApiClient.defaults.baseURL !== baseURL) {
    fundApiClient = axios.create({
      baseURL,
      timeout: 45000,
    });
    attachSdkAuthInterceptors(fundApiClient, fundInterceptorRef);
    fundRequestInterceptorId = fundInterceptorRef.current;
  }

  return fundApiClient;
}

export function getFundUpdateApiClient() {
  const config = requireConfig();
  const baseURL = `${config.apiBaseUrl}${BOUNZ_FUND_UPDATE_PATH}`;

  if (!fundUpdateApiClient || fundUpdateApiClient.defaults.baseURL !== baseURL) {
    fundUpdateApiClient = axios.create({
      baseURL,
      timeout: 45000,
    });
    attachSdkAuthInterceptors(fundUpdateApiClient, fundUpdateInterceptorRef);
  }

  return fundUpdateApiClient;
}

/** SDK Bounz Geidea payment — accepts sdk_user JWT */
export function getBounzPaymentApiClient() {
  const config = requireConfig();
  const baseURL = `${config.apiBaseUrl}${BOUNZ_PAYMENT_PATH}`;

  if (!bounzPaymentApiClient || bounzPaymentApiClient.defaults.baseURL !== baseURL) {
    bounzPaymentApiClient = axios.create({
      baseURL,
      timeout: 45000,
    });
    attachSdkAuthInterceptors(bounzPaymentApiClient, bounzPaymentInterceptorRef);
  }

  return bounzPaymentApiClient;
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

  /** Direct buy gold from fund balance — backend: POST /trade/gold/buy */
  buyGoldWithBalance: data => getApiClient().post('/trade/gold/buy', data),

  /** Settle buy gold after Geidea capture — backend: POST /trade/gold/buy-online */
  buyGoldWithOnlinePayment: data =>
    getApiClient().post('/trade/gold/buy-online', data),

  getTradeHistory: ({ page = 1, limit = 20 } = {}) =>
    getApiClient().get('/trade/history', { params: { page, limit } }),

  /** Buy gold list — same data as getTradeHistory; mirrors main app GET /buygold/?page= */
  getBuyGoldHistory: (page = 1, limit = 20) =>
    getApiClient().get('/trade/history', { params: { page, limit } }),

  /** Direct / online fund deposit request (pending admin approval). */
  fundDeposit: data => getFundApiClient().post('/', data),

  getFundBalance: () => getFundApiClient().get('/balance'),

  listFundDeposits: ({ page = 1, limit = 10, status } = {}) =>
    getFundApiClient().get('/', {
      params: { page, limit, ...(status ? { status } : {}) },
    }),

  /** Same as main app GET /api/funddeposit/?page=N — returns { docs, totalPages, ... } */
  getDepositFundHistory: (page = 1, limit = 20) =>
    getFundApiClient().get('/', { params: { page, limit } }),

  geideaStartPayment: data =>
    getBounzPaymentApiClient().post('/start', data),

  geideaVerifyPayment: data =>
    getBounzPaymentApiClient().post('/verify', data),

  fundDepositAutoApprove: data =>
    getFundUpdateApiClient().post('/autoApprove', data),

  /** Statement audits — mirrors main app GET /api/audits */
  getStatementAudits: (params = {}) =>
    getApiClient().get('/statement', { params }),

  /** Statement PDF — mirrors main app GET /api/audits/getstatmentpdf */
  getStatementPdf: (params = {}) =>
    getApiClient().get('/statement/pdf', { params }),
};
