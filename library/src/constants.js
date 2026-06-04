export const STORAGE_KEY = '@comtechgold/sdk/config';

export const API_HOSTS = {
  local: 'http://192.168.1.4:5055',
  demo: 'https://demoapi.comtechgold.com',
  prod: 'https://appapi.comtechgold.com',
};

export const DEFAULT_PARTNER_CODE = 'BOUNZ';

/** USD→AED multiplier for market gold rate (matches admin: buyGm * 3.675). */
export const DEFAULT_MARKET_CONVERSION = 3.675;

export const TERMS_AND_CONDITIONS_URL =
  'https://comtechgold.com/assets/pdf/Terms_and_Conditions.pdf';

export const SDK_COLORS = {
  primary: '#C9A227',
  primaryDark: '#9A7B1A',
  primaryLight: '#E3B155',
  background: '#0F1419',
  /** Main app dashboard cream */
  backgroundCream: '#F5F0E6',
  headerBg: '#1D1C1E',
  card: '#1A2332',
  cardCream: '#FFFFFF',
  text: '#FFFFFF',
  textDark: '#1D1C1E',
  textMuted: '#9CA3AF',
  textMutedDark: '#6B7280',
  border: '#2D3748',
  borderCream: '#E8E0D4',
  success: '#22C55E',
  error: '#EF4444',
};
