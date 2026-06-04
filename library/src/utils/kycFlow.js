import { Linking } from 'react-native';
import { emitEvent, getConfig } from '../configStore';

let cachedKycMeta = null;

/**
 * @returns {typeof import('react-native-webview').WebView | null}
 */
export function getKycWebViewComponent() {
  try {
    return require('react-native-webview').WebView;
  } catch {
    return null;
  }
}

export function parseKycStatusResponse(res) {
  const body = res?.data;
  return body?.status ?? body?.data?.status ?? 'Unknown';
}

/** Full KYC check payload from GET /kyc/status */
export function parseKycStatusDetail(res) {
  const body = res?.data ?? {};
  const status = parseKycStatusResponse(res);
  const details = body.details ?? null;
  return {
    status,
    comments: body.comments ?? details?.comments ?? '',
    reference: body.reference ?? body.kycCheckData?.reference ?? null,
    details,
  };
}

export function formatKycDisplayStatus(status) {
  const s = String(status || '').trim();
  if (!s || s === '—') {
    return 'Not started';
  }
  return s;
}

export function parseKycStartResponse(res) {
  const body = res?.data ?? {};
  const nested = body.data ?? {};
  return {
    reference:
      body.reference ?? nested.reference ?? body.reference_id ?? null,
    verificationUrl:
      body.verification_url ??
      body.verificationUrl ??
      nested.verification_url ??
      nested.url ??
      body.url ??
      null,
  };
}

/** User has not started or finished KYC submission. */
export function isKycNotStarted(status) {
  const s = String(status || '').trim().toLowerCase();
  return (
    !s ||
    s === '—' ||
    s === 'not yet' ||
    s === 'not started' ||
    s === 'unknown'
  );
}

export function normalizeKycStatus(status) {
  if (isKycNotStarted(status)) {
    return 'not_started';
  }
  const s = String(status || '').toLowerCase();
  if (s === 'approved' || s.includes('accepted')) {
    return 'approved';
  }
  if (
    s === 'rejected' ||
    s === 'declined' ||
    s.includes('declined') ||
    s.includes('reject')
  ) {
    return 'rejected';
  }
  if (
    s === 'pending' ||
    s.includes('pending') ||
    s === 'return for clarification' ||
    s.includes('clarification')
  ) {
    return 'pending';
  }
  return 'unknown';
}

/**
 * @param {string} url
 * @param {{ redirectMatchers?: string[], completeUrl?: string, failedUrl?: string, redirectUrl?: string }} meta
 * @returns {'complete' | 'failed' | 'pending' | null}
 */
export function classifyKycNavigationUrl(url, meta = {}) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const lower = url.toLowerCase();

  const matchers = [
    ...(meta.redirectMatchers || []),
    ...(getConfig()?.kycRedirectMatchers || []),
    meta.completeUrl,
    meta.failedUrl,
    meta.redirectUrl,
    '/api/sdk/bounz/kyc/complete',
    '/api/sdk/bounz/kyc/failed',
  ].filter(Boolean);

  for (const m of matchers) {
    if (m && lower.includes(String(m).toLowerCase())) {
      if (
        lower.includes('failed') ||
        lower.includes('declined') ||
        lower.includes('cancel')
      ) {
        return 'failed';
      }
      if (
        lower.includes('complete') ||
        lower.includes('accepted') ||
        lower.includes('success')
      ) {
        return 'complete';
      }
      return 'complete';
    }
  }

  if (
    lower.includes('verification.declined') ||
    lower.includes('verification.cancelled') ||
    lower.includes('request.declined')
  ) {
    return 'failed';
  }
  if (
    lower.includes('verification.accepted') ||
    lower.includes('verification.completed')
  ) {
    return 'complete';
  }

  return null;
}

export async function fetchKycMeta(apiClient) {
  if (cachedKycMeta) {
    return cachedKycMeta;
  }
  try {
    const res = await apiClient.getKycMeta
      ? await apiClient.getKycMeta()
      : await apiClient.get('/kyc/meta');
    const data = res?.data ?? {};
    cachedKycMeta = {
      callbackUrl: data.callbackUrl,
      redirectUrl: data.redirectUrl,
      completeUrl: data.completeUrl,
      failedUrl: data.failedUrl,
      redirectMatchers: data.redirectMatchers || [],
    };
    return cachedKycMeta;
  } catch {
    return null;
  }
}

export function clearKycMetaCache() {
  cachedKycMeta = null;
}

/**
 * Notify host and open Shufti verification (in-app WebView or system browser).
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function openKycVerification({
  verificationUrl,
  reference,
  navigation,
  kycMeta,
}) {
  const cfg = getConfig();
  const payload = { reference, verificationUrl, kycMeta };

  emitEvent('kyc', { action: 'started', ...payload });
  if (typeof cfg?.onKycStarted === 'function') {
    try {
      await cfg.onKycStarted(payload);
    } catch (e) {
      console.warn('[ComtechGold] onKycStarted error', e);
    }
  }

  if (!verificationUrl) {
    const error = reference
      ? 'Verification started but no URL returned. Try again later.'
      : 'Could not get verification URL. Check server Shufti configuration.';
    emitEvent('error', { source: 'kyc', message: error });
    return { ok: false, error };
  }

  const preferInApp = cfg?.kycOpenMode !== 'external';
  const WebView = getKycWebViewComponent();

  if (preferInApp && WebView && navigation?.navigate) {
    navigation.navigate('KycVerification', {
      verificationUrl,
      reference,
      kycMeta,
    });
    return { ok: true };
  }

  const canOpen = await Linking.canOpenURL(verificationUrl);
  if (!canOpen) {
    const error = 'Cannot open verification link on this device.';
    emitEvent('error', { source: 'kyc', message: error });
    return { ok: false, error };
  }
  await Linking.openURL(verificationUrl);
  return { ok: true };
}

export async function confirmKycOnServer(reference) {
  const { sdkApi } = require('../api/client');
  const res = await sdkApi.confirmKyc(reference);
  return res?.data ?? {};
}

export async function fetchKycStatusFromServer() {
  const { sdkApi } = require('../api/client');
  const res = await sdkApi.getKycStatus();
  return parseKycStatusDetail(res);
}

/**
 * After redirect: confirm on server, read KYC table status, land on home dashboard.
 */
export async function completeKycAfterRedirect(
  navigation,
  redirectResult,
  reference,
) {
  emitEvent('kyc', { action: 'redirect', result: redirectResult });

  let confirmError = null;
  if (reference) {
    try {
      await confirmKycOnServer(reference);
    } catch (e) {
      confirmError =
        e?.response?.data?.error || e?.message || 'Confirm failed';
      console.warn('[ComtechGold] confirmKyc', confirmError);
    }
  }

  let detail = { status: 'Unknown', comments: '', reference };
  try {
    detail = await fetchKycStatusFromServer();
  } catch (e) {
    confirmError =
      confirmError ||
      e?.response?.data?.error ||
      e?.message ||
      'Could not load KYC status';
  }

  const norm = normalizeKycStatus(detail.status);
  let outcome = norm;
  if (redirectResult === 'failed' && norm !== 'approved') {
    outcome = 'failed';
  } else if (redirectResult === 'complete' && norm === 'unknown') {
    outcome = 'pending';
  }

  if (norm === 'approved') {
    emitEvent('kyc', { action: 'approved', status: detail.status });
  } else if (outcome === 'failed' || norm === 'rejected') {
    emitEvent('kyc', { action: 'failed', status: detail.status });
  } else {
    emitEvent('kyc', { action: 'complete', status: detail.status });
  }

  navigation.replace('SdkHome', {
    kycRefresh: Date.now(),
    kycOutcome: outcome,
    kycStatus: detail.status,
    kycComments: detail.comments,
    kycReference: detail.reference || reference,
    kycConfirmError: confirmError,
  });

  return { outcome, detail, confirmError };
}

/** @deprecated use completeKycAfterRedirect */
export function finishKycFlow(navigation, result, refreshStatus, reference) {
  return completeKycAfterRedirect(navigation, result, reference);
}
