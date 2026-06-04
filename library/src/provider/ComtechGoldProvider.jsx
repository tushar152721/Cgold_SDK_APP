import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ComtechGold from '../ComtechGold';
import SdkNavigator from '../navigation/SdkNavigator';
import { SdkPriceProvider } from '../context/SdkPriceContext';
import { SdkCurrencyProvider } from '../context/SdkCurrencyContext';
import { setEventListener } from '../configStore';

/**
 * Wrap the host app (or a subtree) with this provider.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.HostScreen - Host UI (register button lives here)
 * @param {(event: import('../types').ComtechGoldEvent) => void} [props.onEvent]
 * @param {string} [props.initialRouteName]
 * @param {React.ReactNode} [props.children] - Optional; if omitted, SdkNavigator is rendered
 */
export default function ComtechGoldProvider({
  HostScreen,
  onEvent,
  initialRouteName = 'Host',
  children,
}) {
  useEffect(() => {
    if (onEvent) {
      setEventListener(onEvent);
    }
    return () => setEventListener(null);
  }, [onEvent]);

  const content = children ?? (
    <SdkNavigator
      HostScreen={HostScreen}
      initialRouteName={initialRouteName}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SdkPriceProvider>
          <SdkCurrencyProvider>
            <NavigationContainer
              ref={ref => {
                ComtechGold.setNavigationRef(ref);
              }}>
              {content}
            </NavigationContainer>
          </SdkCurrencyProvider>
        </SdkPriceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
