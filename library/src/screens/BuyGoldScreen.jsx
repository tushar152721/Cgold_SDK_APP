import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  InteractionManager,
} from 'react-native';
import { CommonActions, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import FundDepositInput from '../components/fund/FundDepositInput';
import BuyGoldPaymentPicker from '../components/buyGold/BuyGoldPaymentPicker';
import BuyGoldSummaryModal from '../components/buyGold/BuyGoldSummaryModal';
import BuyGoldSuccessModal from '../components/buyGold/BuyGoldSuccessModal';
import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';
import MarketPriceCard from '../components/MarketPriceCard';
import SdkNote from '../components/SdkNote';
import { requireConfig } from '../configStore';
import { loadSdkProfile, clearProfileCache } from '../utils/profileCache';
import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { useSdkPrice } from '../context/SdkPriceContext';
import {
  BUY_GOLD_NOTE,
  BUY_GOLD_PAYMENT_METHODS,
  BUY_GOLD_PAYMENT_NOTES,
} from '../constants/buyGold';
import {
  calculateBuyGoldCharges,
  buyGoldPaymentMethodLabel,
  isOnlineBuyGoldMethod,
} from '../utils/calculateBuyGoldCharges';
import {
  buildBuyGoldOnlinePayload,
  generateBuyGoldOrderId,
  initiateBuyGoldPayment,
  settleSdkBuyGoldOnline,
  verifyGeideaBuyGoldPayment,
} from '../utils/sdkBuyGoldPayment';
import { normalizePaymentStatus } from '../utils/sdkOnlinePayment';
import {
  loadTradeConfig,
  getBuyMinGoldGm,
  getOnlinePaymentCharge,
  getPaymentGatewaySettings,
} from '../utils/tradeConfigCache';
import { validateGoldGrams } from '../utils/tradeLimits';
import { registerPendingGoldBuy } from '../utils/goldBalanceWatcher';
import { getBuyGoldDraft } from '../utils/geideaPaymentStorage';
import { normalizeKycStatus } from '../utils/kycFlow';
import { sdkApi } from '../api/client';
import { getApiErrorMessage } from '../utils/apiError';
import { SDK_COLORS } from '../constants';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';
import MaintenanceModeBanner from '../components/MaintenanceModeBanner';

export default function BuyGoldScreen() {
  const config = requireConfig();
  const navigation = useNavigation();
  const route = useRoute();
  const { formatAed, symbol } = useSdkCurrency();
  const { price } = useSdkPrice();
  const { active: maintenanceActive, message: maintenanceMessage } =
    useMaintenanceMode();

  const [profile, setProfile] = useState(null);
  const [grams, setGrams] = useState(String(getBuyMinGoldGm()));
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentSettingsLoaded, setPaymentSettingsLoaded] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({
    visible: false,
    variant: 'balance',
    goldGm: null,
    alreadyProcessed: false,
  });

  const paymentReturnHandledRef = useRef(false);
  const isProcessingPaymentRef = useRef(false);

  const goToDashboard = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'SdkHome' }],
      }),
    );
  }, [navigation]);

  const showSuccessModal = useCallback(
    ({ variant, goldGm, alreadyProcessed = false }) => {
      const present = () => {
        setSuccessModal({
          visible: true,
          variant,
          goldGm,
          alreadyProcessed,
        });
      };
      if (Platform.OS === 'ios') {
        InteractionManager.runAfterInteractions(present);
        return;
      }
      present();
    },
    [],
  );

  const dismissSuccessModal = useCallback(() => {
    setSuccessModal(prev => ({ ...prev, visible: false }));
    const delay = Platform.OS === 'ios' ? 280 : 0;
    setTimeout(goToDashboard, delay);
  }, [goToDashboard]);

  const refreshProfile = async () => {
    if (!config.userToken) {
      return;
    }
    const data = await loadSdkProfile({ force: true });
    setProfile(data);
  };

  useEffect(() => {
    if (!config.userToken) {
      return;
    }
    loadSdkProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
    loadTradeConfig()
      .then(() => setPaymentSettingsLoaded(true))
      .catch(() => setPaymentSettingsLoaded(true));
  }, [config.userToken]);

  const user = profile?.user || {};
  const currency = user.currency || 'AED';
  const fundBalance = Number(user.fundTotal ?? 0);
  const buyGm = price?.buyGm;
  const marketOpen = Boolean(price?.isMarket);
  const kycOk =
    normalizeKycStatus(profile?.kycStatus) === 'approved' ||
    profile?.kycStatus === 'Approved';
  const buyMinGm = getBuyMinGoldGm();
  const methodLabel = buyGoldPaymentMethodLabel(paymentMethod);
  const isOnline = isOnlineBuyGoldMethod(paymentMethod);
  const isBalance = paymentMethod === 'my_balance';

  const goldValue = useMemo(() => {
    const g = parseFloat(grams);
    const rate = Number(buyGm);
    if (!g || Number.isNaN(g) || !rate) {
      return null;
    }
    return Number((g * rate).toFixed(2));
  }, [grams, buyGm]);

  const charges = useMemo(() => {
    if (!goldValue || !paymentMethod) {
      return null;
    }
    return calculateBuyGoldCharges({
      goldGm: grams,
      buyGmAed: buyGm,
      currency,
      paymentMethodId: paymentMethod,
      onlineCharges: getOnlinePaymentCharge(),
    });
  }, [grams, buyGm, currency, paymentMethod, goldValue]);

  const balanceAfter = useMemo(() => {
    if (!isBalance || goldValue == null) {
      return null;
    }
    return Math.max(0, fundBalance - goldValue);
  }, [isBalance, fundBalance, goldValue]);

  const insufficientBalance =
    isBalance && goldValue != null && goldValue > fundBalance;

  const canReview =
    paymentMethod != null &&
    goldValue != null &&
    goldValue > 0 &&
    kycOk &&
    marketOpen &&
    !maintenanceActive &&
    !insufficientBalance;

  const processPaymentReturn = useCallback(
    async params => {
      if (!params?.isFromPayment || isProcessingPaymentRef.current) {
        return;
      }
      if (paymentReturnHandledRef.current) {
        return;
      }
      paymentReturnHandledRef.current = true;
      isProcessingPaymentRef.current = true;
      setSubmitting(true);

      try {
        const status = normalizePaymentStatus(params.status);
        if (status === 'cancelled by user' || status === 'cancelled') {
          Alert.alert('Payment cancelled', params.message || 'Payment was cancelled.');
          return;
        }
        if (status !== 'captured') {
          Alert.alert(
            'Payment failed',
            params.message || 'Payment was not completed. Please try again.',
          );
          return;
        }

        const verified = await verifyGeideaBuyGoldPayment({
          orderId: params.order_id,
          status: 'Captured',
        });

        if (normalizePaymentStatus(verified.verifiedStatus) !== 'captured') {
          throw new Error('Payment could not be verified');
        }

        const goldPayload = await buildBuyGoldOnlinePayload({
          verified,
          routeParams: params,
        });

        const draft = (await getBuyGoldDraft()) || {};
        const result = await settleSdkBuyGoldOnline({ goldPayload });
        const buyGoldId = result?.buyGoldId ?? result?.data?.buyGoldId;
        const alreadyProcessed = Boolean(result?.alreadyProcessed);

        clearProfileCache();
        const freshProfile = await loadSdkProfile({ force: true });
        setProfile(freshProfile);

        const baselineGold = Number(
          freshProfile?.user?.goldTotal ?? draft.baselineGold ?? 0,
        );

        if (buyGoldId) {
          registerPendingGoldBuy({
            buyGoldId,
            baselineGold,
            goldGm: goldPayload.goldGm,
            source: 'online',
            skipMinDelay: alreadyProcessed,
          });
        }
        setGrams(String(buyMinGm));
        setPaymentMethod(null);

        showSuccessModal({
          variant: 'online',
          goldGm: goldPayload.goldGm,
          alreadyProcessed,
        });
      } catch (err) {
        Alert.alert(
          'Buy gold failed',
          getApiErrorMessage(err, 'Could not complete buy gold after payment.'),
        );
      } finally {
        isProcessingPaymentRef.current = false;
        setSubmitting(false);
        navigation.setParams({ isFromPayment: undefined });
      }
    },
    [buyMinGm, navigation, showSuccessModal],
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.isFromPayment && !paymentReturnHandledRef.current) {
        processPaymentReturn(route.params);
      }
    }, [route.params?.isFromPayment, processPaymentReturn]),
  );

  const startOnlinePayment = async () => {
    const validation = validateGoldGrams(grams, 'buy');
    if (!validation.ok) {
      Alert.alert('Invalid amount', validation.message);
      return;
    }
    if (!charges) {
      Alert.alert('Enter amount', 'Please enter a valid gram amount.');
      return;
    }

    setSubmitting(true);
    try {
      await loadSdkProfile({ force: true });
      const orderId = generateBuyGoldOrderId();
      const paymentSettings = getPaymentGatewaySettings();
      const payment = await initiateBuyGoldPayment({
        goldGm: validation.goldGm,
        buyGmAed: buyGm,
        currency,
        paymentSettings,
        paymentMethodLabel: methodLabel,
        orderId,
        charges,
        user,
        marketOpen,
      });

      setSummaryVisible(false);

      navigation.navigate('GeideaPayment', {
        sessionId: payment.sessionId,
        returnScreen: 'BuyGold',
        request_id: payment.requestId,
        merchantReferenceId: payment.merchantReferenceId,
        goldGm: validation.goldGm,
        rate: buyGm,
        currency,
        isMarket: marketOpen,
        amount: charges.totalPayable,
        originalAmount: charges.totalPayable,
        actualDepositAmount: charges.enteredFund,
        onlineTransactionWay: methodLabel,
        transactionFee: charges.processingFee,
        serviceFee: charges.processingFee,
        vatFee: charges.gstFee,
        totalCharges: charges.totalCharges,
      });
    } catch (err) {
      if (err?.sdkSessionExpired) {
        return;
      }
      Alert.alert(
        'Payment error',
        getApiErrorMessage(err, 'Payment could not be started. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBalanceBuy = async () => {
    const validation = validateGoldGrams(grams, 'buy');
    if (!validation.ok) {
      Alert.alert('Invalid amount', validation.message);
      return;
    }
    if (insufficientBalance) {
      Alert.alert('Low balance', `You need ${formatAed(goldValue, 2)} in your fund balance.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await sdkApi.buyGoldWithBalance({
        goldGm: validation.goldGm,
        amount: goldValue,
        rate: Number(buyGm),
        currency,
        isMarket: marketOpen,
      });
      const body = res?.data;
      if (body?.success === false) {
        throw new Error(body?.error || body?.message || 'Buy gold failed');
      }

      const buyGoldId = body?.data?.buyGoldId;
      clearProfileCache();
      const freshProfile = await loadSdkProfile({ force: true });
      setProfile(freshProfile);
      const baselineGold = Number(freshProfile?.user?.goldTotal ?? 0);

      if (buyGoldId) {
        registerPendingGoldBuy({
          buyGoldId,
          baselineGold,
          goldGm: validation.goldGm,
          source: 'balance',
        });
      }
      setSummaryVisible(false);
      setGrams(String(buyMinGm));
      setPaymentMethod(null);

      showSuccessModal({
        variant: 'balance',
        goldGm: validation.goldGm,
      });
    } catch (err) {
      Alert.alert(
        'Buy gold failed',
        getApiErrorMessage(err, 'Could not complete purchase. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSummaryConfirm = () => {
    if (isOnline) {
      startOnlinePayment();
      return;
    }
    handleBalanceBuy();
  };

  const handleReviewPress = () => {
    if (!paymentMethod) {
      Alert.alert('Payment method', 'Please select a payment method.');
      return;
    }
    if (!kycOk) {
      Alert.alert('KYC required', 'Complete KYC before buying gold.');
      return;
    }
    if (!marketOpen) {
      Alert.alert('Market closed', 'Buying is disabled until the market reopens.');
      return;
    }
    const validation = validateGoldGrams(grams, 'buy');
    if (!validation.ok) {
      Alert.alert('Invalid amount', validation.message);
      return;
    }
    if (insufficientBalance) {
      Alert.alert('Low balance', 'Insufficient fund balance for this purchase.');
      return;
    }
    setSummaryVisible(true);
  };

  const paymentNote = paymentMethod
    ? BUY_GOLD_PAYMENT_NOTES[paymentMethod]
    : null;

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact pageTitle="Buy gold" onBack={goToDashboard} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {maintenanceActive ? (
          <MaintenanceModeBanner message={maintenanceMessage} />
        ) : null}

        <View style={styles.balanceBlock}>
          <View style={styles.balanceLabelRow}>
            <View style={styles.liveDot} />
            <Text style={styles.balanceLabel}>Available fund balance</Text>
          </View>
          <Text style={styles.balanceValue}>{formatAed(fundBalance, 2)}</Text>
        </View>

        <View style={styles.priceRow}>
          <MarketPriceCard compact />
        </View>

        {!kycOk ? (
          <SdkNote variant="warn">
            KYC must be Approved before you can buy gold.
          </SdkNote>
        ) : null}
        {!marketOpen ? (
          <SdkNote variant="warn">
            Market is currently closed. Live buy pricing is unavailable.
          </SdkNote>
        ) : null}

        <FundDepositInput
          label="Grams to buy"
          value={grams}
          onChangeText={text => setGrams(text.replace(/[^0-9.]/g, ''))}
          placeholder={String(buyMinGm)}
          keyboardType="decimal-pad"
          hint={
            goldValue != null
              ? `Estimated value ${formatAed(goldValue, 2)} at live price`
              : `Minimum ${buyMinGm} g`
          }
        />

        <BuyGoldPaymentPicker
          methods={BUY_GOLD_PAYMENT_METHODS}
          value={paymentMethod}
          onChange={setPaymentMethod}
          note={paymentNote}
        />

        {isOnline && goldValue != null && paymentSettingsLoaded && charges ? (
          <Text style={styles.chargesHint}>
            Total payable with charges: {formatAed(charges.totalPayable, 2)}
          </Text>
        ) : null}

        {insufficientBalance ? (
          <Text style={styles.errorHint}>
            Insufficient fund balance. Add funds or pay by card.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.payBtn, (!canReview || submitting) && styles.payBtnDisabled]}
          onPress={handleReviewPress}
          disabled={!canReview || submitting}
          activeOpacity={0.9}>
          {submitting ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text
              style={[
                styles.payBtnText,
                (!canReview || submitting) && styles.payBtnTextDisabled,
              ]}>
              Review & buy
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>{BUY_GOLD_NOTE}</Text>

        <View style={styles.footer}>
          <ComtechGoldCopyrightFooter variant="cream" />
        </View>
      </ScrollView>

      <BuyGoldSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        onConfirm={handleSummaryConfirm}
        grams={grams}
        goldValue={goldValue}
        fundBalance={fundBalance}
        balanceAfter={balanceAfter}
        charges={charges}
        paymentMethodLabel={methodLabel}
        isOnline={isOnline}
        confirming={submitting}
        confirmDisabled={insufficientBalance}
        formatAmount={formatAed}
      />

      <BuyGoldSuccessModal
        visible={successModal.visible}
        onClose={dismissSuccessModal}
        variant={successModal.variant}
        goldGm={successModal.goldGm}
        alreadyProcessed={successModal.alreadyProcessed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  balanceBlock: {
    marginBottom: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#C9A227',
    padding: 10,
    borderRadius: 10,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SDK_COLORS.success,
    marginRight: 6,
  },
  balanceLabel: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
  },
  priceRow: {
    marginBottom: 12,
  },
  chargesHint: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -6,
  },
  errorHint: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 14,
    minHeight: 56,
  },
  payBtnDisabled: {
    backgroundColor: '#EDE6D4',
  },
  payBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  payBtnTextDisabled: {
    color: 'rgba(154, 123, 26, 0.45)',
  },
  note: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 28,
  },
});
