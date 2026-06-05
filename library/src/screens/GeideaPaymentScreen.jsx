import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Alert,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import { PAYMENT_GATEWAY } from '../utils/paymentGateway';
import { SDK_COLORS } from '../constants';

function buildGeideaHtml(sessionId) {
  const safeSessionId = JSON.stringify(String(sessionId ?? ''));
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #fff; }</style>
</head>
<body>
  <script src="https://payments.geidea.ae/hpp/geideaCheckout.min.js"><\/script>
  <script>
    window.addEventListener('load', function () {
      if (typeof GeideaCheckout === 'undefined') {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          responseCode: 'SDK_LOAD_FAILED',
          responseMessage: 'Geidea SDK failed to load'
        }));
        return;
      }
      try {
        var sessionId = ${safeSessionId};
        var payment = new GeideaCheckout(
          function(data) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', data: data }));
          },
          function(data) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: data }));
          },
          function(data) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel', data: data }));
          }
        );
        payment.startPayment(sessionId);
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          responseCode: 'SDK_EXCEPTION',
          responseMessage: e.message || 'SDK threw an exception'
        }));
      }
    });
  <\/script>
</body>
</html>`;
}

export default function GeideaPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    sessionId,
    returnScreen = 'AddFund',
    request_id: initialRequestId,
    merchantReferenceId,
    onlineTransactionWay,
    actualDepositAmount,
    transactionFee,
    serviceFee,
    vatFee,
    totalCharges,
    originalAmount,
    amount,
  } = route.params || {};

  const hasNavigatedRef = useRef(false);
  const requestIdRef = useRef(initialRequestId || sessionId);

  const chargeFields = () => ({
    actualDepositAmount,
    transactionFee,
    serviceFee,
    vatFee,
    totalCharges,
    originalAmount,
    onlineTransactionWay,
    amount,
    paymentGateway: PAYMENT_GATEWAY.GEIDEA,
  });

  const navigateBack = useCallback(
    params => {
      if (hasNavigatedRef.current) {
        return;
      }
      hasNavigatedRef.current = true;
      navigation.navigate(returnScreen, {
        ...chargeFields(),
        ...params,
        isFromPayment: true,
      });
    },
    [
      navigation,
      returnScreen,
      actualDepositAmount,
      transactionFee,
      serviceFee,
      vatFee,
      totalCharges,
      originalAmount,
      onlineTransactionWay,
      amount,
    ],
  );

  const handleCancellation = () => {
    navigateBack({
      status: 'CancelledByUser',
      message: 'Transaction was cancelled',
      transaction_id: '',
      order_id: requestIdRef.current,
      request_id: requestIdRef.current,
      merchantReferenceId,
    });
  };

  const finishFromSdk = (type, data = {}) => {
    if (type === 'cancel') {
      handleCancellation();
      return;
    }

    const isSuccess =
      type === 'success' &&
      (data?.responseCode === '000' ||
        String(data?.status || '').toLowerCase() === 'captured');

    navigateBack({
      ...data,
      status: isSuccess
        ? 'Captured'
        : data?.responseCode === '001'
          ? 'Declined'
          : data?.status || 'Failed',
      transaction_id: data?.orderId || data?.transactionId || '',
      message:
        data?.responseMessage ||
        data?.detailedResponseMessage ||
        (isSuccess ? 'Payment successful' : 'Payment failed'),
      order_id: data?.orderId || requestIdRef.current || sessionId,
      request_id: requestIdRef.current,
      merchantReferenceId,
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!hasNavigatedRef.current) {
          Alert.alert(
            'Cancel transaction',
            'Are you sure you want to cancel this payment?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', style: 'destructive', onPress: handleCancellation },
            ],
          );
        }
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  const handleMessage = event => {
    if (hasNavigatedRef.current) {
      return;
    }
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      finishFromSdk(parsed.type, parsed.data || parsed);
    } catch (e) {
      if (__DEV__) {
        console.warn('[GeideaPayment]', e);
      }
    }
  };

  if (!sessionId) {
    return (
      <SafeAreaView style={styles.root}>
        <ComtechGoldHeader compact pageTitle="Payment" />
        <Text style={styles.errorText}>
          Missing Geidea session. Please try again.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ComtechGoldHeader compact pageTitle="Secure payment" />
      <WebView
        source={{
          html: buildGeideaHtml(sessionId),
          baseUrl: 'https://payments.geidea.ae',
        }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="compatibility"
        style={styles.webview}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={SDK_COLORS.primary} />
            <Text style={styles.loadingText}>Loading payment…</Text>
          </View>
        )}
        onError={() => {
          navigateBack({
            status: 'Failed',
            message: 'Payment page failed to load',
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 10,
    color: SDK_COLORS.primary,
  },
  errorText: {
    padding: 24,
    textAlign: 'center',
    color: SDK_COLORS.textDark,
  },
});
