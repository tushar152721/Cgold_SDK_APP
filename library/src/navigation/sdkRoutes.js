/** Routes shown after the user has linked Bounz (menu + sidebar apply). */
export const SDK_AUTHENTICATED_ROUTES = [
  'SdkHome',
  'Profile',
  'TradeHistory',
  'Kyc',
  'Trade',
  'BuyGold',
  'AddFund',
  'GeideaPayment',
  'FundDepositHistory',
  'StatementHistory',
  'AboutUs',
];

/** Screens that show the slide-out menu button. */
export const SDK_MENU_ROUTES = SDK_AUTHENTICATED_ROUTES.filter(
  name => name !== 'GeideaPayment',
);

/** Screens that use the back chevron (gesture / hardware back to previous). */
export const SDK_ROUTES_WITH_BACK = [
  'Profile',
  'TradeHistory',
  'Kyc',
  'Trade',
  'BuyGold',
  'AddFund',
  'GeideaPayment',
  'FundDepositHistory',
  'StatementHistory',
  'AboutUs',
];

export const SDK_ROUTE_PAGE_TITLES = {
  Profile: 'Profile',
  TradeHistory: 'Trade history',
  Kyc: 'KYC details',
  Trade: 'Buy & sell',
  BuyGold: 'Buy gold',
  AddFund: 'Add funds',
  GeideaPayment: 'Payment',
  FundDepositHistory: 'Fund history',
  StatementHistory: 'Statement history',
  AboutUs: 'About us',
};

/** Slide-out menu entries (all authenticated SDK features). */
export const SDK_MENU_ITEMS = [
  {
    key: 'SdkHome',
    label: 'Dashboard',
    subtitle: 'Balances & overview',
    section: 'main',
  },
  {
    key: 'AddFund',
    label: 'Add funds',
    subtitle: 'Bank transfer or online payment',
    section: 'actions',
  },
  {
    key: 'BuyGold',
    label: 'Buy gold',
    subtitle: 'Pay from fund balance or card',
    section: 'actions',
  },
  {
    key: 'Trade',
    label: 'Buy with points',
    subtitle: 'Redeem Bounz loyalty points',
    params: { mode: 'buy' },
    section: 'actions',
  },
  {
    key: 'Profile',
    label: 'Profile',
    subtitle: 'Account & gold holdings',
    section: 'account',
  },
  {
    key: 'Kyc',
    label: 'KYC details',
    subtitle: 'Verification status',
    section: 'account',
  },
  {
    key: 'TradeHistory',
    label: 'Trade history',
    subtitle: 'Past gold purchases',
    section: 'history',
  },
  {
    key: 'FundDepositHistory',
    label: 'Fund history',
    subtitle: 'Deposit requests & status',
    section: 'history',
  },
  {
    key: 'StatementHistory',
    label: 'Statement history',
    subtitle: 'Gold & fund transactions',
    section: 'history',
  },
  {
    key: 'AboutUs',
    label: 'About us',
    subtitle: 'Mission, team & ComTech Gold',
    section: 'about',
  },
];

export const SDK_MENU_SECTION_LABELS = {
  actions: 'Buy & fund',
  account: 'Account',
  history: 'History',
  about: 'About',
};

export function isSdkAuthenticatedRoute(routeName) {
  return SDK_AUTHENTICATED_ROUTES.includes(routeName);
}

export function isSdkMenuRoute(routeName) {
  return SDK_MENU_ROUTES.includes(routeName);
}

export function routeShowsBack(routeName) {
  return SDK_ROUTES_WITH_BACK.includes(routeName);
}
