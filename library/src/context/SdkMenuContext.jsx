import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CommonActions } from '@react-navigation/native';
import { isSdkAuthenticatedRoute } from '../navigation/sdkRoutes';

const SdkMenuContext = createContext(null);

export function SdkMenuProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [menuScope, setMenuScope] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const navigationRef = useRef(null);

  const registerNavigation = useCallback(nav => {
    navigationRef.current = nav;
  }, []);

  const syncActiveRoute = useCallback(routeName => {
    const allowed = routeName && isSdkAuthenticatedRoute(routeName);
    setMenuScope(Boolean(allowed));
    setCurrentRoute(routeName || null);
    if (!allowed) {
      setVisible(false);
    }
  }, []);

  const openMenu = useCallback(() => {
    if (menuScope) {
      setVisible(true);
    }
  }, [menuScope]);

  const closeMenu = useCallback(() => setVisible(false), []);

  const navigateFromMenu = useCallback(routeName => {
    setVisible(false);
    const nav = navigationRef.current;
    if (!nav?.dispatch) {
      return;
    }

    if (routeName === 'SdkHome') {
      nav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SdkHome' }],
        }),
      );
      return;
    }

    nav.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'SdkHome' }, { name: routeName }],
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      visible,
      menuScope,
      currentRoute,
      navigationRef,
      openMenu,
      closeMenu,
      navigateFromMenu,
      registerNavigation,
      syncActiveRoute,
      setMenuScope,
      setCurrentRoute,
    }),
    [
      visible,
      menuScope,
      currentRoute,
      openMenu,
      closeMenu,
      navigateFromMenu,
      registerNavigation,
      syncActiveRoute,
    ],
  );

  return (
    <SdkMenuContext.Provider value={value}>{children}</SdkMenuContext.Provider>
  );
}

export function useSdkMenuOptional() {
  return useContext(SdkMenuContext);
}

export function useSdkMenu() {
  const ctx = useContext(SdkMenuContext);
  if (!ctx) {
    throw new Error('useSdkMenu must be used within SdkMenuProvider');
  }
  return ctx;
}
