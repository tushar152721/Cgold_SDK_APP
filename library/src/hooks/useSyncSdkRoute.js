import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSdkMenuOptional } from '../context/SdkMenuContext';

/** Keeps menu scope in sync with the active SDK route (including modals without header). */
export default function useSyncSdkRoute() {
  const navigation = useNavigation();
  const route = useRoute();
  const menu = useSdkMenuOptional();

  useEffect(() => {
    if (!menu) {
      return undefined;
    }
    menu.registerNavigation(navigation);
    menu.syncActiveRoute(route.name);
    const unsub = navigation.addListener('focus', () => {
      menu.syncActiveRoute(route.name);
    });
    return unsub;
  }, [navigation, route.name, menu]);
}
