import {
  clearConfig,
  emitEvent,
  getConfig,
  persistAndSetConfig,
  requireConfig,
  restoreConfigFromStorage,
  setEventListener,
} from './configStore';

let navigationRef = null;

const ComtechGold = {
  /**
   * Initialize SDK with host-provided identity context.
   * @param {import('./types').ComtechGoldInitParams} params
   */
  async init(params) {
    return persistAndSetConfig(params);
  },

  async restoreSession() {
    return restoreConfigFromStorage();
  },

  getConfig() {
    return getConfig();
  },

  isInitialized() {
    return Boolean(getConfig()?.initialized);
  },

  /**
   * @param {(event: import('./types').ComtechGoldEvent) => void} listener
   */
  setEventListener(listener) {
    setEventListener(listener);
  },

  setNavigationRef(ref) {
    navigationRef = ref;
  },

  /** Open ComTech connect screen (register + link in one step). */
  openLink() {
    requireConfig();
    navigateSdk('ConnectComtech');
  },

  /**
   * Open SDK register entry (pre-filled from init params).
   */
  openRegister() {
    requireConfig();
    navigateSdk('ConnectComtech');
    emitEvent('register', { action: 'open' });
  },

  /** Open main SDK hub (KYC + Bounz points buy). */
  openSdk() {
    requireConfig();
    navigateSdk('SdkHome');
  },

  openKyc() {
    requireConfig();
    navigateSdk('Kyc');
    emitEvent('kyc', { action: 'open' });
  },

  openBuy() {
    requireConfig();
    navigateSdk('BuyGold');
    emitEvent('buy', { action: 'open' });
  },

  openTrade(mode = 'buy') {
    requireConfig();
    navigateSdk('Trade', { mode });
  },

  openProfile() {
    requireConfig();
    navigateSdk('Profile');
  },

  /** After 401 — reset embedded or provider stack to connect (keeps init config). */
  resetToConnect() {
    if (!navigationRef?.isReady?.()) {
      return;
    }
    const state = navigationRef.getRootState?.();
    const routeNames = state?.routeNames || state?.routes?.map(r => r.name) || [];
    const hasHost = routeNames.includes('Host');
    navigationRef.reset({
      index: 0,
      routes: [{ name: hasHost ? 'ConnectComtech' : 'ConnectComtech' }],
    });
  },

  /** Past Bounz point gold purchases. */
  openPurchaseHistory() {
    requireConfig();
    navigateSdk('TradeHistory');
  },

  /** Gold & fund statement history with calendar filter and PDF download. */
  openStatementHistory() {
    requireConfig();
    navigateSdk('StatementHistory');
  },

  openAboutUs() {
    requireConfig();
    navigateSdk('AboutUs');
  },

  async logout() {
    await clearConfig();
    if (navigationRef?.isReady?.()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Host' }],
      });
    }
  },
};

function navigateSdk(screen, params) {
  if (!navigationRef?.isReady?.()) {
    console.warn(
      '[ComtechGold] Navigation not ready. Wrap app with ComtechGoldProvider.',
    );
    return;
  }
  navigationRef.navigate(screen, params);
}

export default ComtechGold;
