import { useRoute } from '@react-navigation/native';
import {
  isSdkMenuRoute,
  routeShowsBack,
  SDK_ROUTE_PAGE_TITLES,
} from '../navigation/sdkRoutes';
import { useSdkMenuOptional } from '../context/SdkMenuContext';

/**
 * Header chrome derived from the active SDK stack route.
 */
export default function useSdkHeaderOptions(overrides = {}) {
  const route = useRoute();
  const menu = useSdkMenuOptional();
  const routeName = route.name;
  const menuScope = menu?.menuScope === true;

  const showMenu =
    overrides.showMenu != null
      ? overrides.showMenu
      : menuScope && isSdkMenuRoute(routeName);

  const showBack =
    overrides.showBack != null
      ? overrides.showBack
      : routeShowsBack(routeName);

  let pageTitle = overrides.pageTitle;
  if (pageTitle === undefined) {
    pageTitle = SDK_ROUTE_PAGE_TITLES[routeName];
  }

  if (routeName === 'Trade' || routeName === 'BuyGold') {
    const mode = route.params?.mode;
    if (mode === 'sell') {
      pageTitle = 'Sell gold';
    } else if (mode !== undefined || routeName === 'BuyGold') {
      pageTitle = 'Buy gold';
    }
  }

  return {
    showMenu,
    showBack,
    pageTitle,
    routeName,
  };
}
