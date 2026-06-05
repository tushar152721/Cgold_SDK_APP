import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  InteractionManager,
  Platform,
} from 'react-native';
import { CommonActions, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import FundDepositInput from '../components/fund/FundDepositInput';
import PaymentMethodPicker from '../components/fund/PaymentMethodPicker';
import BankInformationModal from '../components/fund/BankInformationModal';
import FundChargesModal from '../components/fund/FundChargesModal';
import FundDepositSuccessModal from '../components/fund/FundDepositSuccessModal';
import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';
import { requireConfig } from '../configStore';
import { loadSdkProfile, clearProfileCache } from '../utils/profileCache';
import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { useSdkPrice } from '../context/SdkPriceContext';
import { estimateGoldGramsFromFund } from '../utils/fundDepositEstimate';
import {
  buildFundDepositPayload,
  isOnlinePaymentMethod,
} from '../utils/buildFundDepositPayload';
import {
  calculateFundDepositCharges,
  paymentMethodLabel,
} from '../utils/calculateFundDepositCharges';
import {
  loadTradeConfig,
  getOnlinePaymentCharge,
  getPaymentGatewaySettings,
} from '../utils/tradeConfigCache';
import {
  generateDepositOrderId,
  initiateFundDepositPayment,
  normalizePaymentStatus,
  settleSdkFundDeposit,
  verifyGeideaPayment,
} from '../utils/sdkOnlinePayment';
import { getFundDepositDraft } from '../utils/geideaPaymentStorage';
import { sdkApi } from '../api/client';
import { getApiErrorMessage } from '../utils/apiError';
import { FUND_DEPOSIT_NOTE } from '../constants/fundDeposit';
import { SDK_COLORS } from '../constants';

export default function AddFundScreen() {
  const config = requireConfig();
  const navigation = useNavigation();
  const route = useRoute();
  const { formatAed, buyConversion, symbol } = useSdkCurrency();
  const { price } = useSdkPrice();

  const [profile, setProfile] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactionNo, setTransactionNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [chargesModalVisible, setChargesModalVisible] = useState(false);
  const [calculatedCharges, setCalculatedCharges] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettingsLoaded, setPaymentSettingsLoaded] = useState(false);
  const [successModal, setSuccessModal] = useState({
    visible: false,
    variant: 'online',
    amount: null,
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
    ({ variant, amount: creditedAmount, alreadyProcessed = false }) => {
      const present = () => {
        setSuccessModal({
          visible: true,
          variant,
          amount: creditedAmount,
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
  const fundBalance = user.fundTotal ?? 0;
  const buyGm = price?.buyGm;
  const methodLabel = paymentMethodLabel(paymentMethod);

  const goldGramHint = useMemo(() => {
    const grams = estimateGoldGramsFromFund(amount, buyGm, buyConversion);
    if (grams == null) {
      return null;
    }
    return `${grams} grams of gold can be purchased with this Fund`;
  }, [amount, buyGm, buyConversion]);

  const handlePaymentChange = method => {
    setPaymentMethod(method);
    if (method === 'direct_transfer') {
      setBankModalVisible(true);
    }
  };

  const hasPaymentMethod = paymentMethod != null;
  const isDirectTransfer = paymentMethod === 'direct_transfer';
  const isOnline = isOnlinePaymentMethod(paymentMethod);
  const amountNum = Number(amount);
  const hasValidAmount = Number.isFinite(amountNum) && amountNum > 0;
  const hasTransaction = transactionNo.trim().length > 0;

  const canPay =
    hasPaymentMethod &&
    hasValidAmount &&
    (isDirectTransfer ? hasTransaction : isOnline);

  const computeCharges = useCallback(() => {
    const onlineCharges = getOnlinePaymentCharge();
    return calculateFundDepositCharges({
      amount: amountNum,
      currency,
      paymentMethodId: paymentMethod,
      onlineCharges,
    });
  }, [amountNum, currency, paymentMethod]);

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

        const verified = await verifyGeideaPayment({
          orderId: params.order_id,
          status: 'Captured',
        });

        if (normalizePaymentStatus(verified.verifiedStatus) !== 'captured') {
          throw new Error('Payment could not be verified');
        }

        const draft = (await getFundDepositDraft()) || {};
        const charges = draft.charges || {};
        const grossAmount = Number(
          params.originalAmount ?? draft.amount ?? amountNum,
        );
        const netAmount = Number(
          params.actualDepositAmount ?? charges.totalPayable ?? draft.payableFund,
        );

        const fundPayload = {
          amount: netAmount,
          actualAmount: grossAmount,
          originalAmount: grossAmount,
          paymentID: verified.orderId,
          trNo: verified.transactionId || verified.orderId,
          refNo: verified.orderId,
          paymentVia: 'Online Deposit',
          currency: draft.currency || currency,
          onlineTransactionWay:
            params.onlineTransactionWay || draft.paymentMethodLabel || methodLabel,
          status: 'Approved',
          approveStatus: 'approve',
          serviceFee: Number(params.serviceFee ?? charges.processingFee ?? 0),
          vatFee: Number(params.vatFee ?? charges.gstFee ?? 0),
          transactionFee: Number(params.transactionFee ?? 0),
          totalCharges: Number(params.totalCharges ?? charges.totalCharges ?? 0),
          date: new Date().toISOString(),
        };

        const result = await settleSdkFundDeposit({ fundPayload });

        clearProfileCache();
        await refreshProfile();
        setAmount('');
        setTransactionNo('');

        showSuccessModal({
          variant: 'online',
          amount: netAmount,
          alreadyProcessed: Boolean(result?.alreadyProcessed),
        });
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          'Could not complete fund deposit after payment.',
        );
        Alert.alert('Deposit failed', message);
      } finally {
        isProcessingPaymentRef.current = false;
        setSubmitting(false);
        navigation.setParams({ isFromPayment: undefined });
      }
    },
    [amountNum, currency, methodLabel, navigation, showSuccessModal],
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.isFromPayment && !paymentReturnHandledRef.current) {
        processPaymentReturn(route.params);
      }
    }, [route.params?.isFromPayment, processPaymentReturn]),
  );

  const startOnlinePayment = async () => {
    const charges = computeCharges();
    if (!charges) {
      Alert.alert('Enter amount', 'Please enter a valid amount.');
      return;
    }

    if (!config.userToken) {
      Alert.alert(
        'Not connected',
        'Please link your ComTech account again, then retry payment.',
      );
      return;
    }

    setSubmitting(true);
    try {
      await loadSdkProfile({ force: true });
      const orderId = generateDepositOrderId();
      const paymentSettings = getPaymentGatewaySettings();
      const payment = await initiateFundDepositPayment({
        amount: amountNum,
        currency,
        paymentSettings,
        paymentMethodLabel: methodLabel,
        orderId,
        charges,
        user,
      });

      setChargesModalVisible(false);

      navigation.navigate('GeideaPayment', {
        sessionId: payment.sessionId,
        returnScreen: 'AddFund',
        request_id: payment.requestId,
        merchantReferenceId: payment.merchantReferenceId,
        amount: amountNum,
        originalAmount: amountNum,
        actualDepositAmount: charges.totalPayable,
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
      const data = err?.response?.data;
      const message = getApiErrorMessage(
        err,
        'Payment could not be started. Please try again.',
      );
      const hint =
        err?.response?.status === 502 || data?.source === 'geidea'
          ? '\n\nCheck server Geidea keys (MERCHANT_KEY, API_PASSWORD) in env and restart the API.'
          : err?.response?.status === 400 && String(message).toLowerCase().includes('kyc')
            ? '\n\nComplete KYC in the SDK before paying by card.'
            : '';
      Alert.alert('Payment error', `${message}${hint}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!canPay || submitting) {
      return;
    }

    if (!hasPaymentMethod) {
      Alert.alert('Payment method', 'Please select a payment method to continue.');
      return;
    }

    if (isOnline) {
      if (!/^\d+(\.\d{1,2})?$/.test(String(amount).trim())) {
        Alert.alert(
          'Validation',
          'Amount must be valid (up to two decimal places).',
        );
        return;
      }
      const charges = computeCharges();
      if (!charges) {
        Alert.alert('Enter amount', 'Please enter a valid amount.');
        return;
      }
      setCalculatedCharges(charges);
      setChargesModalVisible(true);
      return;
    }

    const apiPayload = buildFundDepositPayload({
      amount: amountNum,
      currency,
      buyConversion,
      paymentMethodId: paymentMethod,
      transactionNumber: transactionNo,
    });

    setSubmitting(true);
    try {
      const res = await sdkApi.fundDeposit(apiPayload);
      const deposit = res?.data?.data ?? res?.data;

      clearProfileCache();
      await refreshProfile();

      setAmount('');
      setTransactionNo('');

      showSuccessModal({
        variant: 'direct',
        amount: amountNum,
      });

      if (__DEV__ && deposit?._id) {
        console.log('[AddFund] deposit created', deposit._id);
      }
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Deposit failed. Please try again.',
      );
      Alert.alert('Deposit failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ComtechGoldHeader
        compact
        pageTitle="Add funds"
        onBack={goToDashboard}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* <View style={styles.titleRow}>
          <Text style={styles.titleGold}>Add </Text>
          <Text style={styles.titleDark}>Funds</Text>
        </View> */}

        <View style={styles.balanceBlock}>
          <View style={styles.balanceLabelRow}>
            <View style={styles.liveDot} />
            <Text style={styles.balanceLabel}>Available My Balance</Text>
          </View>
          <Text style={styles.balanceValue}>
            {formatAed(fundBalance, 2)}
          </Text>
        </View>

        <FundDepositInput
          label="Enter your fund"
          prefix={`${symbol} `}
          value={amount}
          onChangeText={text => setAmount(text.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          hint={goldGramHint}
        />

        <PaymentMethodPicker value={paymentMethod} onChange={handlePaymentChange} />

        {isDirectTransfer ? (
          <>
            <FundDepositInput
              label="Enter your transaction no"
              value={transactionNo}
              onChangeText={setTransactionNo}
              placeholder="Enter Transaction No"
            />
            <TouchableOpacity
              style={styles.bankLink}
              onPress={() => setBankModalVisible(true)}
              activeOpacity={0.8}>
              <Text style={styles.bankLinkText}>View bank information</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {isOnline && hasValidAmount && paymentSettingsLoaded ? (
          <Text style={styles.chargesHint}>
            Estimated credit after charges:{' '}
            {formatAed(computeCharges()?.totalPayable ?? 0, 2)}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.payBtn, (!canPay || submitting) && styles.payBtnDisabled]}
          onPress={handlePayNow}
          disabled={!canPay || submitting}
          activeOpacity={0.9}>
          {submitting ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <>
              <Text
                style={[
                  styles.payBtnText,
                  (!canPay || submitting) && styles.payBtnTextDisabled,
                ]}>
                Pay Now
              </Text>
              {canPay ? (
                <View style={styles.payArrow}>
                  <Text style={styles.payArrowText}>›</Text>
                </View>
              ) : null}
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>{FUND_DEPOSIT_NOTE}</Text>

        <View style={styles.footer}>
          <ComtechGoldCopyrightFooter variant="cream" />
        </View>
      </ScrollView>

      <BankInformationModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        currency={currency}
      />

      <FundChargesModal
        visible={chargesModalVisible}
        onClose={() => setChargesModalVisible(false)}
        onConfirm={startOnlinePayment}
        calculatedCharges={calculatedCharges}
        currency={currency}
        paymentMethod={methodLabel}
        confirming={submitting}
        formatAmount={formatAed}
      />

      <FundDepositSuccessModal
        visible={successModal.visible}
        onClose={dismissSuccessModal}
        variant={successModal.variant}
        amount={successModal.amount}
        alreadyProcessed={successModal.alreadyProcessed}
        formatAmount={formatAed}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleGold: {
    fontSize: 22,
    fontWeight: '700',
    color: SDK_COLORS.primary,
  },
  titleDark: {
    fontSize: 22,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  balanceBlock: {
    marginBottom: 22,
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
    fontSize: 34,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
  },
  bankLink: {
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 16,
  },
  bankLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: SDK_COLORS.primary,
    textDecorationLine: 'underline',
  },
  chargesHint: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -8,
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
  payArrow: {
    position: 'absolute',
    right: 22,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payArrowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: -2,
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
