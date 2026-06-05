import { useEffect } from 'react';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSdkMenuOptional } from '../context/SdkMenuContext';

/** Keeps drawer scope in sync with the active stack route (all screens). */
export default function SdkMenuRouteSync() {
  const navigation = useNavigation();
  const menu = useSdkMenuOptional();
  const routeName = useNavigationState(state => {
    if (!state?.routes?.length) {
      return null;
    }
    return state.routes[state.index]?.name ?? null;
  });

  useEffect(() => {
    if (!menu || !routeName) {
      return;
    }
    menu.registerNavigation(navigation);
    menu.syncActiveRoute(routeName);
  }, [menu, navigation, routeName]);

  return null;
}
