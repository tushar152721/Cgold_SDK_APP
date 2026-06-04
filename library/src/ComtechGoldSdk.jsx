import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ComtechGold from './ComtechGold';
import { setEventListener } from './configStore';
import { SDK_COLORS } from './constants';
import { SdkEmbeddedProvider } from './context/SdkEmbeddedContext';
import { SdkPriceProvider } from './context/SdkPriceContext';
import { SdkCurrencyProvider } from './context/SdkCurrencyContext';
import EmbeddedSdkNavigator from './navigation/EmbeddedSdkNavigator';

/**
 * Drop-in SDK UI: pass init params, render <Sdk /> — init, navigation, and flows are handled inside.
 *
 * @param {import('./types').ComtechGoldSdkProps} props
 */
export default function ComtechGoldSdk({
  config: configProp,
  mobile,
  countryCode,
  loyaltyId,
  environment,
  apiKey,
  partnerCode,
  partnerKey,
  apiBaseUrl,
  secretKey,
  userToken,
  onEvent,
  onReady,
  onInitError,
  onKycStarted,
  kycOpenMode,
  initialRouteName = 'ConnectComtech',
  style,
}) {
  const initParams = useMemo(
    () => ({
      mobile: configProp?.mobile ?? mobile,
      countryCode: configProp?.countryCode ?? countryCode,
      loyaltyId: configProp?.loyaltyId ?? loyaltyId ?? '',
      environment: configProp?.environment ?? environment ?? 'demo',
      partnerCode: configProp?.partnerCode ?? partnerCode,
      partnerKey: configProp?.partnerKey ?? partnerKey ?? configProp?.apiKey ?? apiKey,
      apiKey: configProp?.apiKey ?? apiKey,
      secretKey: configProp?.secretKey ?? secretKey,
      userToken: configProp?.userToken ?? userToken,
      userDetails: configProp?.userDetails,
      apiBaseUrl: configProp?.apiBaseUrl ?? apiBaseUrl,
      kycOpenMode: configProp?.kycOpenMode ?? kycOpenMode,
      onKycStarted: configProp?.onKycStarted ?? onKycStarted,
    }),
    [
      configProp,
      mobile,
      countryCode,
      loyaltyId,
      environment,
      apiKey,
      secretKey,
      userToken,
      apiBaseUrl,
      kycOpenMode,
      onKycStarted,
    ],
  );

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState(null);
  const initGeneration = useRef(0);
  const hasReadyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onInitErrorRef = useRef(onInitError);

  onReadyRef.current = onReady;
  onInitErrorRef.current = onInitError;

  useEffect(() => {
    if (onEvent) {
      setEventListener(onEvent);
    }
    return () => setEventListener(null);
  }, [onEvent]);

  const initSignature = useMemo(
    () =>
      [
        initParams.mobile,
        initParams.countryCode,
        initParams.loyaltyId,
        initParams.environment,
        initParams.apiBaseUrl,
        initParams.partnerCode,
        initParams.partnerKey,
      ].join('|'),
    [
      initParams.mobile,
      initParams.countryCode,
      initParams.loyaltyId,
      initParams.environment,
      initParams.apiBaseUrl,
      initParams.partnerCode,
      initParams.partnerKey,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    const generation = ++initGeneration.current;

    if (!initParams.mobile || !initParams.countryCode) {
      setStatus('error');
      setErrorMessage('Sdk requires mobile and countryCode (props or config).');
      return undefined;
    }

    (async () => {
      if (!hasReadyRef.current) {
        setStatus('loading');
      }
      setErrorMessage(null);
      try {
        await ComtechGold.init({
          ...initParams,
          userToken: initParams.userToken || undefined,
        });
        if (!cancelled && generation === initGeneration.current) {
          hasReadyRef.current = true;
          setStatus('ready');
          onReadyRef.current?.(ComtechGold.getConfig());
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'SDK initialization failed';
        if (!cancelled && generation === initGeneration.current) {
          hasReadyRef.current = false;
          setStatus('error');
          setErrorMessage(message);
          onInitErrorRef.current?.(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initSignature]);

  if (status === 'loading' && !hasReadyRef.current) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="large" color={SDK_COLORS.primary} />
        <Text style={styles.statusText}>Loading ComTech SDK…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.centered, style]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, style]}>
      <SafeAreaProvider>
        <SdkEmbeddedProvider embedded>
          <SdkPriceProvider>
            <SdkCurrencyProvider>
              <NavigationIndependentTree>
                <NavigationContainer
                  ref={ref => {
                    ComtechGold.setNavigationRef(ref);
                  }}>
                  <EmbeddedSdkNavigator initialRouteName={initialRouteName} />
                </NavigationContainer>
              </NavigationIndependentTree>
            </SdkCurrencyProvider>
          </SdkPriceProvider>
        </SdkEmbeddedProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 480,
  },
  centered: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SDK_COLORS.background,
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: SDK_COLORS.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
  },
});
