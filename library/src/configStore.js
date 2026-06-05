import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_HOSTS, DEFAULT_PARTNER_CODE, STORAGE_KEY } from './constants';
import { resetApiClient } from './api/client';
import { clearTradeConfigCache } from './utils/tradeConfigCache';
import { clearProfileCache } from './utils/profileCache';
import { clearMaintenanceMode } from './utils/maintenanceMode';
import { resetPendingBuyTracker } from './utils/pendingBuyTracker';
import { resetGoldBalanceWatcher } from './utils/goldBalanceWatcher';
import { clearPendingDashboardGoldRefresh } from './utils/dashboardRefreshBus';

/** @type {import('./types').ComtechGoldConfig | null} */
let memoryConfig = null;

/** @type {((event: import('./types').ComtechGoldEvent) => void) | null} */
let eventListener = null;

export function setEventListener(listener) {
  eventListener = listener;
}

export function emitEvent(type, payload = {}) {
  eventListener?.({ type, payload });
}

export function getConfig() {
  return memoryConfig;
}

export function requireConfig() {
  if (!memoryConfig?.initialized) {
    throw new Error(
      'ComtechGold SDK is not initialized. Call ComtechGold.init() first.',
    );
  }
  return memoryConfig;
}

/**
 * Remove SDK user JWT but keep host identity (mobile, partner keys).
 */
export async function clearUserToken() {
  if (!memoryConfig) {
    return;
  }
  memoryConfig.userToken = null;
  clearTradeConfigCache();
  clearProfileCache();
  clearMaintenanceMode();
  resetPendingBuyTracker();
  resetGoldBalanceWatcher();
  clearPendingDashboardGoldRefresh();
  resetApiClient();
  const persisted = { ...memoryConfig };
  delete persisted.onKycStarted;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

/**
 * @param {string} token - Bearer token from bootstrap/register
 */
export async function setUserToken(token) {
  if (!memoryConfig) {
    return;
  }
  if (!token) {
    return clearUserToken();
  }
  memoryConfig.userToken = token;
  resetApiClient();
  clearProfileCache();
  const { refreshSdkPriceAfterAuth } = require('./utils/sdkPriceSocket');
  refreshSdkPriceAfterAuth();
  const persisted = { ...memoryConfig };
  delete persisted.onKycStarted;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

/**
 * @param {import('./types').ComtechGoldInitParams} params
 */
export async function persistAndSetConfig(params) {
  const environment = params.environment ?? 'demo';
  const normalizedCountryCode = normalizeCountryCode(params.countryCode);
  const normalizedMobile = String(params.mobile || '').replace(/\D/g, '');

  if (!normalizedMobile) {
    throw new Error('ComtechGold.init: mobile is required');
  }
  if (!normalizedCountryCode) {
    throw new Error('ComtechGold.init: countryCode is required');
  }

  memoryConfig = {
    initialized: true,
    mobile: normalizedMobile,
    countryCode: normalizedCountryCode,
    loyaltyId: (params.loyaltyId || '').trim(),
    partnerCode: params.partnerCode || DEFAULT_PARTNER_CODE,
    partnerKey: params.partnerKey || params.apiKey || '',
    userToken: params.userToken || memoryConfig?.userToken || null,
    environment,
    apiBaseUrl:
      params.apiBaseUrl ||
      API_HOSTS[environment] ||
      API_HOSTS.demo,
    userDetails: params.userDetails || null,
    /** @type {'in_app' | 'external'} */
    kycOpenMode: params.kycOpenMode === 'external' ? 'external' : 'in_app',
    onKycStarted:
      typeof params.onKycStarted === 'function' ? params.onKycStarted : null,
  };

  resetApiClient();
  const { onKycStarted, ...persisted } = memoryConfig;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  memoryConfig.onKycStarted = onKycStarted;
  emitEvent('init', { loyaltyId: memoryConfig.loyaltyId });
  return memoryConfig;
}

export async function restoreConfigFromStorage() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    memoryConfig = JSON.parse(raw);
    memoryConfig.onKycStarted = null;
    if (!memoryConfig.kycOpenMode) {
      memoryConfig.kycOpenMode = 'in_app';
    }
    resetApiClient();
    return memoryConfig;
  } catch {
    return null;
  }
}

export async function clearConfig() {
  memoryConfig = null;
  clearTradeConfigCache();
  clearProfileCache();
  clearMaintenanceMode();
  resetPendingBuyTracker();
  resetGoldBalanceWatcher();
  clearPendingDashboardGoldRefresh();
  resetApiClient();
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function normalizeCountryCode(code) {
  const trimmed = String(code || '').trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}
