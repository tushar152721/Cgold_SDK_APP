import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  applyMaintenanceMode,
  getMaintenanceMessage,
  isMaintenanceModeActive,
} from '../utils/maintenanceMode';
import { useSdkPrice } from '../context/SdkPriceContext';

/**
 * Reactive maintenance flag from price socket + profile payloads + 503 buy errors.
 */
export function useMaintenanceMode() {
  const { price } = useSdkPrice();
  const [, tick] = useState(0);

  const refresh = useCallback(() => {
    if (price?.maintenanceMode) {
      applyMaintenanceMode(price.maintenanceMode);
    }
    tick(n => n + 1);
  }, [price?.maintenanceMode]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    active: isMaintenanceModeActive(),
    message: getMaintenanceMessage(),
    refresh,
  };
}
