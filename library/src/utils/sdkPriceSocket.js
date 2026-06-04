import { io } from 'socket.io-client';
import { getConfig } from '../configStore';
import { sdkApi } from '../api/client';
import { applyMaintenanceMode, extractMaintenanceFromApi } from './maintenanceMode';

const PRICE_UPDATE_EVENT = 'getpriceUpdate';
const THROTTLE_MS = 300;

let socket = null;
let socketBaseUrl = null;
let socketUserToken = null;
let refCount = 0;
let lastRestFetchAt = 0;
let restFetchInFlight = null;
const REST_COOLDOWN_MS = 5000;

const listeners = new Set();

function notifyListeners(payload) {
  listeners.forEach(fn => {
    try {
      fn(payload);
    } catch (e) {
      console.warn('[sdkPriceSocket]', e);
    }
  });
}

function normalizePrice(data) {
  if (!data) {
    return null;
  }
  const maintenanceMode = extractMaintenanceFromApi({ data });
  applyMaintenanceMode(maintenanceMode);
  return {
    buyGm: data.buyGm,
    sellGm: data.sellGm,
    buyGmOriginal: data.buyGmOriginal,
    isMarket: data.isMarket,
    currentCommission: data.currentCommission,
    buyConversion: data.buyConversion,
    sellConversion: data.sellConversion,
    conversionFrom: data.conversionFrom,
    maintenanceMode,
  };
}

async function fetchRestPrice(force) {
  const config = getConfig();
  if (!config?.apiBaseUrl) {
    return null;
  }
  const now = Date.now();
  if (!force && now - lastRestFetchAt < REST_COOLDOWN_MS) {
    return null;
  }
  if (restFetchInFlight) {
    return restFetchInFlight;
  }

  restFetchInFlight = (async () => {
    try {
      const apiCall = config.userToken
        ? sdkApi.getMarketPrice()
        : sdkApi.getMarketMeta();
      const res = await apiCall;
      const normalized = normalizePrice(res?.data?.data ?? res?.data);
      if (normalized) {
        lastRestFetchAt = Date.now();
        notifyListeners({ price: normalized, connected: socket?.connected });
      }
      return normalized;
    } catch {
      return null;
    } finally {
      restFetchInFlight = null;
    }
  })();

  return restFetchInFlight;
}

function ensureSocket() {
  const config = getConfig();
  const baseUrl = config?.apiBaseUrl;
  const token = config?.userToken || '';

  if (!baseUrl) {
    return;
  }

  if (
    socket &&
    socketBaseUrl === baseUrl &&
    socketUserToken === token &&
    socket.connected
  ) {
    return;
  }

  if (socket) {
    socket.off(PRICE_UPDATE_EVENT);
    socket.disconnect();
    socket = null;
  }

  socketBaseUrl = baseUrl;
  socketUserToken = token;
  socket = io(baseUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  let pending = null;
  let lastDispatch = 0;

  const flush = data => {
    const normalized = normalizePrice(data);
    if (normalized) {
      notifyListeners({ price: normalized, connected: true });
    }
    pending = null;
    lastDispatch = Date.now();
  };

  const onPriceUpdate = data => {
    const elapsed = Date.now() - lastDispatch;
    if (elapsed >= THROTTLE_MS) {
      if (pending) {
        clearTimeout(pending);
        pending = null;
      }
      flush(data);
      return;
    }
    if (pending) {
      clearTimeout(pending);
    }
    pending = setTimeout(() => flush(data), THROTTLE_MS - elapsed);
  };

  socket.on('connect', () => {
    notifyListeners({ connected: true });
  });

  socket.on('disconnect', () => {
    notifyListeners({ connected: false });
  });

  socket.on(PRICE_UPDATE_EVENT, onPriceUpdate);
}

export function subscribeSdkPrice(listener) {
  refCount += 1;
  listeners.add(listener);
  ensureSocket();
  fetchRestPrice(false);

  return () => {
    listeners.delete(listener);
    refCount -= 1;
    if (refCount <= 0) {
      refCount = 0;
      if (socket) {
        socket.disconnect();
        socket = null;
        socketBaseUrl = null;
        socketUserToken = null;
      }
    }
  };
}

/** Force a REST price refresh (e.g. dashboard pull-to-refresh / header refresh). */
export function refreshSdkMarketPrice() {
  lastRestFetchAt = 0;
  return fetchRestPrice(true);
}

/** Call after connect when user token is set (upgrade REST from meta → price). */
export function refreshSdkPriceAfterAuth() {
  const config = getConfig();
  const baseUrl = config?.apiBaseUrl;
  const token = config?.userToken || '';

  lastRestFetchAt = 0;
  if (
    socket &&
    (socketBaseUrl !== baseUrl || socketUserToken !== token)
  ) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  ensureSocket();
  return fetchRestPrice(true);
}
