import { getConfig } from '../configStore';
import { sdkApi } from '../api/client';
import { loadTradeConfig } from './tradeConfigCache';
import { applyMaintenanceMode } from './maintenanceMode';

let cache = { token: null, profile: null, fetchedAt: 0 };
let loadPromise = null;
const TTL_MS = 15000;

export async function loadSdkProfile(options = {}) {
  const { force = false } = options;
  const token = getConfig()?.userToken;
  if (!token) {
    cache = { token: null, profile: null, fetchedAt: 0 };
    return null;
  }

  const fresh =
    !force &&
    cache.token === token &&
    cache.profile &&
    Date.now() - cache.fetchedAt < TTL_MS;

  if (fresh) {
    return cache.profile;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    await loadTradeConfig().catch(() => null);
    const res = await sdkApi.getProfile();
    const profile = res?.data ?? null;
    if (profile?.maintenanceMode) {
      applyMaintenanceMode(profile.maintenanceMode);
    }
    cache = { token, profile, fetchedAt: Date.now() };
    return profile;
  })().finally(() => {
    loadPromise = null;
  });

  return loadPromise;
}

export function clearProfileCache() {
  cache = { token: null, profile: null, fetchedAt: 0 };
  loadPromise = null;
}
