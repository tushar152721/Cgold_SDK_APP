import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SDK_COLORS } from '../constants';
import {
  classifyKycNavigationUrl,
  completeKycAfterRedirect,
  getKycWebViewComponent,
} from '../utils/kycFlow';
import useSyncSdkRoute from '../hooks/useSyncSdkRoute';

function extractReferenceFromUrl(url) {
  if (!url) return null;
  try {
    const q = url.split('?')[1];
    if (!q) return null;
    const params = new URLSearchParams(q);
    return params.get('reference') || params.get('reference_id');
  } catch {
    return null;
  }
}

export default function KycVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  useSyncSdkRoute();
  const verificationUrl = route.params?.verificationUrl;
  const kycReference = route.params?.reference;
  const kycMeta = route.params?.kycMeta || {};
  const WebView = getKycWebViewComponent();
  const handledRef = useRef(false);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState('verify');

  const finishRedirect = useCallback(
    async (result, url) => {
      if (handledRef.current) {
        return;
      }
      handledRef.current = true;
      setPhase('syncing');
      const ref = extractReferenceFromUrl(url) || kycReference;
      try {
        await completeKycAfterRedirect(
          navigation,
          result === 'failed' ? 'failed' : 'complete',
          ref,
        );
      } catch (e) {
        console.warn('[ComtechGold] completeKycAfterRedirect', e);
        navigation.replace('SdkHome', {
          kycRefresh: Date.now(),
          kycOutcome: result === 'failed' ? 'failed' : 'pending',
          kycStatus: 'Unknown',
          kycConfirmError: e?.message || 'Could not update KYC status',
        });
      }
    },
    [navigation, kycReference],
  );

  const onNavigationChange = useCallback(
    navState => {
      const url = navState?.url;
      const result = classifyKycNavigationUrl(url, kycMeta);
      if (!result) {
        return;
      }
      finishRedirect(result, url);
    },
    [kycMeta, finishRedirect],
  );

  const onDone = useCallback(() => {
    finishRedirect('complete');
  }, [finishRedirect]);

  if (phase === 'syncing') {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={SDK_COLORS.primary} />
        <Text style={styles.syncTitle}>Updating your KYC status</Text>
        <Text style={styles.syncSub}>
          Confirming verification and refreshing your dashboard…
        </Text>
      </SafeAreaView>
    );
  }

  if (!WebView || !verificationUrl) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <Text style={styles.error}>Verification URL is not available.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Kyc')}>
          <Text style={styles.btnText}>Back to KYC</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Identity verification</Text>
        <TouchableOpacity onPress={onDone} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Complete verification below. When finished you will return to your
        dashboard with an updated KYC status.
      </Text>

      <View style={styles.webWrap}>
        <WebView
          style={styles.webview}
          source={{ uri: verificationUrl }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={SDK_COLORS.primary} />
            </View>
          )}
          onNavigationStateChange={onNavigationChange}
          onShouldStartLoadWithRequest={request => {
            const result = classifyKycNavigationUrl(request?.url, kycMeta);
            if (result) {
              onNavigationChange({ url: request.url });
              return false;
            }
            return true;
          }}
          onError={() => setLoadError(true)}
          onHttpError={() => setLoadError(true)}
        />
        {loadError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              Could not load the verification page. Tap Done when finished.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: SDK_COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: SDK_COLORS.border,
  },
  toolbarTitle: {
    color: SDK_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 8,
  },
  doneText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 13,
  },
  hint: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    lineHeight: 17,
  },
  webWrap: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    minHeight: 280,
  },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  syncTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
  },
  syncSub: {
    marginTop: 8,
    fontSize: 14,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  error: {
    color: SDK_COLORS.textMutedDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: SDK_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
