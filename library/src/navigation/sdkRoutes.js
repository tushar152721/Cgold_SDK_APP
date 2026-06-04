/** Routes shown after the user has linked Bounz (menu + sidebar apply). */
export const SDK_AUTHENTICATED_ROUTES = [
  'SdkHome',
  'Profile',
  'TradeHistory',
  'Kyc',
  'Trade',
  'BuyGold',
  'AddFund',
  'FundDepositHistory',
];

/** Screens that show the slide-out menu button. */
export const SDK_MENU_ROUTES = SDK_AUTHENTICATED_ROUTES;

/** Screens that use the back chevron (gesture / hardware back to previous). */
export const SDK_ROUTES_WITH_BACK = [
  'Profile',
  'TradeHistory',
  'Kyc',
  'Trade',
  'BuyGold',
  'AddFund',
  'FundDepositHistory',
];

export const SDK_ROUTE_PAGE_TITLES = {
  Profile: 'Profile',
  TradeHistory: 'Trade history',
  Kyc: 'KYC details',
  Trade: 'Buy & sell',
  BuyGold: 'Buy gold',
  AddFund: 'Add funds',
  FundDepositHistory: 'Fund history',
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
