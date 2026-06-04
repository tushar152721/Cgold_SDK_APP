import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import FundDepositInput from '../components/fund/FundDepositInput';
import PaymentMethodPicker from '../components/fund/PaymentMethodPicker';
import BankInformationModal from '../components/fund/BankInformationModal';
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
import { sdkApi } from '../api/client';
import { getApiErrorMessage } from '../utils/apiError';
import { FUND_DEPOSIT_NOTE } from '../constants/fundDeposit';
import { SDK_COLORS } from '../constants';

const DEFAULT_PAYMENT = 'direct_transfer';

export default function AddFundScreen() {
  const config = requireConfig();
  const { formatAed, buyConversion, symbol } = useSdkCurrency();
  const { price } = useSdkPrice();

  const [profile, setProfile] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactionNo, setTransactionNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  }, [config.userToken]);

  const user = profile?.user || {};
  const currency = user.currency || 'AED';
  const fundBalance = user.fundTotal ?? 0;
  const buyGm = price?.buyGm;

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

  const isDirectTransfer = paymentMethod === 'direct_transfer';
  const amountNum = Number(amount);
  const hasValidAmount = Number.isFinite(amountNum) && amountNum > 0;
  const hasTransaction = transactionNo.trim().length > 0;

  const canPay = isDirectTransfer
    ? hasValidAmount && hasTransaction
    : hasValidAmount;

  const handlePayNow = async () => {
    if (!canPay || submitting) {
      return;
    }

    if (isOnlinePaymentMethod(paymentMethod)) {
      Alert.alert(
        'Online payment',
        'Card, Google Pay, and Apple Pay will be available in a future update. Please use Direct Transfer for now.',
      );
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

      Alert.alert(
        'Funds request submitted',
        'Your direct deposit request was submitted successfully. Funds will appear after admin approval.',
        [{ text: 'OK' }],
      );

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
      <ComtechGoldHeader compact pageTitle="" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Text style={styles.titleGold}>Add </Text>
          <Text style={styles.titleDark}>Funds</Text>
        </View>

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

        <PaymentMethodPicker value={paymentMethod} onChange={handlePaymentChange} />

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
    alignItems: 'center',
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
