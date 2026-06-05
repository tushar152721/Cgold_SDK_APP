import { sdkApi } from '../api/client';
import { DEFAULT_POINTS_PER_AED } from './tradeEstimate';
import {
  SDK_BUY_MIN_GOLD_GM,
  SDK_SELL_MIN_GOLD_GM,
} from './tradeLimits';

/** @type {{ pointsPerAed: number, buyMinGoldGm: number, sellMinGoldGm: number, buyMaxGoldGm: number|null, onlinePaymentCharge: object|null, paymentGatewayByCurrency: object|null } | null} */
let cache = null;
let loadPromise = null;

export function getCachedTradeConfig() {
  return cache;
}

export function getPointsPerAed() {
  const n = Number(cache?.pointsPerAed);
  return n > 0 ? n : DEFAULT_POINTS_PER_AED;
}

export function getBuyMinGoldGm() {
  const n = Number(cache?.buyMinGoldGm);
  return n > 0 ? n : SDK_BUY_MIN_GOLD_GM;
}

export function getSellMinGoldGm() {
  const n = Number(cache?.sellMinGoldGm);
  return n > 0 ? n : SDK_SELL_MIN_GOLD_GM;
}

export function getBuyMaxGoldGm() {
  const n = Number(cache?.buyMaxGoldGm);
  return n > 0 ? n : null;
}

export function getOnlinePaymentCharge() {
  return cache?.onlinePaymentCharge || {};
}

export function getPaymentGatewaySettings() {
  return {
    paymentGatewayByCurrency: cache?.paymentGatewayByCurrency || null,
    onlinePaymentCharge: cache?.onlinePaymentCharge || null,
  };
}

export async function loadTradeConfig(force = false) {
  if (cache && !force) {
    return cache;
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const res = await sdkApi.getTradeConfig();
    const data = res?.data ?? {};
    const buyMin =
      Number(data.buyMinGoldGm) > 0
        ? Number(data.buyMinGoldGm)
        : Number(data.platformMinGoldGm) > 0
          ? Number(data.platformMinGoldGm)
          : SDK_BUY_MIN_GOLD_GM;
    const sellMin =
      Number(data.sellMinGoldGm) > 0
        ? Number(data.sellMinGoldGm)
        : SDK_SELL_MIN_GOLD_GM;
    const buyMax = Number(data.buyMaxGoldGm);
    cache = {
      pointsPerAed:
        Number(data.pointsPerAed) > 0
          ? Number(data.pointsPerAed)
          : DEFAULT_POINTS_PER_AED,
      buyMinGoldGm: buyMin,
      sellMinGoldGm: sellMin,
      buyMaxGoldGm: buyMax > 0 ? buyMax : null,
      onlinePaymentCharge: data.onlinePaymentCharge || null,
      paymentGatewayByCurrency: data.paymentGatewayByCurrency || null,
    };
    return cache;
  })().finally(() => {
    loadPromise = null;
  });

  return loadPromise;
}

export function clearTradeConfigCache() {
  cache = null;
  loadPromise = null;
}
