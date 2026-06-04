import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useSdkMenu } from '../context/SdkMenuContext';

/**
 * Android hardware back: close menu first, then pop SDK stack (not the host app).
 */
export default function SdkBackHandler() {
  const { visible, closeMenu, menuScope, navigationRef } = useSdkMenu();

  useEffect(() => {
    const onBack = () => {
      if (visible) {
        closeMenu();
        return true;
      }

      if (!menuScope) {
        return false;
      }

      const nav = navigationRef.current;
      if (nav?.canGoBack?.()) {
        nav.goBack();
        return true;
      }

      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [visible, closeMenu, menuScope, navigationRef]);

  return null;
}
