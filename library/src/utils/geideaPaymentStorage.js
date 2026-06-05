import AsyncStorage from '@react-native-async-storage/async-storage';

const GEIDEA_SESSION_KEY = '@comtechgold/sdk/geideaSession';
const FUND_DEPOSIT_DRAFT_KEY = '@comtechgold/sdk/fundDepositDraft';
const BUY_GOLD_DRAFT_KEY = '@comtechgold/sdk/buyGoldDraft';

export async function storeGeideaSession({
  sessionId,
  merchantReferenceId,
  purpose,
  orderId,
  gateway,
} = {}) {
  const id = String(sessionId || '').trim();
  if (!id) {
    return;
  }
  await AsyncStorage.setItem(
    GEIDEA_SESSION_KEY,
    JSON.stringify({
      sessionId: id,
      merchantReferenceId: merchantReferenceId || null,
      purpose: purpose || null,
      orderId: orderId || null,
      gateway: gateway || 'Geidea',
      storedAt: Date.now(),
    }),
  );
}

export async function getGeideaSession() {
  try {
    const raw = await AsyncStorage.getItem(GEIDEA_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.sessionId ? parsed : null;
  } catch {
    return null;
  }
}

export async function resolveGeideaSessionId(fallbackOrderId) {
  const session = await getGeideaSession();
  if (session?.sessionId) {
    return String(session.sessionId).trim();
  }
  const draft = await getFundDepositDraft();
  const fromDraft = String(draft?.geideaSessionId || '').trim();
  if (fromDraft) {
    return fromDraft;
  }
  const fallback = String(fallbackOrderId || '').trim();
  return fallback || null;
}

export async function clearGeideaSession() {
  try {
    await AsyncStorage.removeItem(GEIDEA_SESSION_KEY);
  } catch {
    // ignore
  }
}

export async function storeFundDepositDraft(draft) {
  await AsyncStorage.setItem(FUND_DEPOSIT_DRAFT_KEY, JSON.stringify(draft));
}

export async function getFundDepositDraft() {
  try {
    const raw = await AsyncStorage.getItem(FUND_DEPOSIT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearFundDepositDraft() {
  try {
    await AsyncStorage.removeItem(FUND_DEPOSIT_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export async function storeBuyGoldDraft(draft) {
  await AsyncStorage.setItem(BUY_GOLD_DRAFT_KEY, JSON.stringify(draft));
}

export async function getBuyGoldDraft() {
  try {
    const raw = await AsyncStorage.getItem(BUY_GOLD_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearBuyGoldDraft() {
  try {
    await AsyncStorage.removeItem(BUY_GOLD_DRAFT_KEY);
  } catch {
    // ignore
  }
}
