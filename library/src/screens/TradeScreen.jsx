import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BuyGoldPaymentPicker from '../components/buyGold/BuyGoldPaymentPicker';
import {
  BOUNZ_TRADE_PAYMENT_METHODS,
  BOUNZ_TRADE_PAYMENT_NOTES,
} from '../constants/buyGold';
import { requireConfig } from '../configStore';
import {
  createBuyIdempotencyKey,
  notifyBuyTransaction,
} from '../utils/buyNotify';
import { useSdkPrice } from '../context/SdkPriceContext';
import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { sdkApi } from '../api/client';
import { SDK_COLORS } from '../constants';
import SdkScreenLayout, { layoutCardStyles as ls } from '../components/SdkScreenLayout';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import InfoRow from '../components/InfoRow';
import MarketPriceCard from '../components/MarketPriceCard';
import PointsGoldCard from '../components/PointsGoldCard';
import SdkNote from '../components/SdkNote';
import { normalizeKycStatus } from '../utils/kycFlow';
import { quotePointsForGold } from '../utils/tradeQuote';
import { estimateMaxGoldFromPoints } from '../utils/tradeEstimate';
import {
  getPointsPerAed,
  getBuyMinGoldGm,
} from '../utils/tradeConfigCache';
import { loadSdkProfile } from '../utils/profileCache';
import {
  validateGoldGrams,
  getEffectiveBuyMaxGoldGm,
} from '../utils/tradeLimits';
import { unwrapApiData } from '../utils/parseApiData';
import { usePendingBuyPoller } from '../hooks/usePendingBuyPoller';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';
import OrderStatusBanner from '../components/OrderStatusBanner';
import MaintenanceModeBanner from '../components/MaintenanceModeBanner';

export default function TradeScreen({ route }) {
  const navigation = useNavigation();
  const config = requireConfig();
  const { price } = useSdkPrice();
  const { formatAed } = useSdkCurrency();
  const [pointsPerAed, setPointsPerAed] = useState(200);
  const [grams, setGrams] = useState(String(getBuyMinGoldGm()));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tradePaymentMethod, setTradePaymentMethod] = useState('bounz_points');
  const { banner: orderBanner, dismissBanner } = usePendingBuyPoller({
    enabled: Boolean(config.userToken),
  });
  const { active: maintenanceActive, message: maintenanceMessage } =
    useMaintenanceMode();

  const loadProfile = async (options = {}) => {
    try {
      const data = await loadSdkProfile({
        force: Boolean(options.force),
      });
      setProfile(data);
      setPointsPerAed(getPointsPerAed());
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (config.userToken) {
      loadProfile();
    }
  }, [config.userToken]);

  const kycOk =
    normalizeKycStatus(profile?.kycStatus) === 'approved' ||
    profile?.kycStatus === 'Approved';
  const canBuy = profile?.canUseBounzPoints === true;
  const marketOpen = Boolean(price?.isMarket);

  const maxBuyGoldGm = useMemo(() => {
    const fromPoints = estimateMaxGoldFromPoints(
      profile?.pointBalance,
      price?.buyGm,
      pointsPerAed,
    );
    return getEffectiveBuyMaxGoldGm(fromPoints);
  }, [profile?.pointBalance, price?.buyGm, pointsPerAed]);

  /** Recalculated locally when grams or socket price changes — no /trade/quote calls. */
  const quote = useMemo(() => {
    return quotePointsForGold(
      grams,
      price?.buyGm,
      pointsPerAed,
      getBuyMinGoldGm(),
      maxBuyGoldGm,
    );
  }, [grams, price?.buyGm, pointsPerAed, maxBuyGoldGm]);

  const buyMinGm = getBuyMinGoldGm();

  useEffect(() => {
    setGrams(g => {
      const n = parseFloat(g);
      if (!g || Number.isNaN(n) || n < buyMinGm) {
        return String(buyMinGm);
      }
      return g;
    });
  }, [buyMinGm]);

  const handleBuy = async () => {
    const validation = validateGoldGrams(grams, 'buy', maxBuyGoldGm);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    const goldGm = validation.goldGm;
    if (!kycOk) {
      setError('Complete KYC before buying');
      return;
    }
    if (!marketOpen) {
      setError('Market is closed. Try again when market is open.');
      return;
    }
    if (maintenanceActive) {
      setError(maintenanceMessage);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await sdkApi.tradeBuy(goldGm, createBuyIdempotencyKey());
      const data = unwrapApiData(res);
      const orderStatus = data?.status;
      const freshProfile = await loadSdkProfile({ force: true });
      setProfile(freshProfile);
      notifyBuyTransaction({
        success: true,
        goldGm,
        response: res,
        baselineGold: Number(freshProfile?.user?.goldTotal ?? 0),
      });
      if (orderStatus === 'Pending') {
        setSuccess(
          `Order placed successfully for ${goldGm} g. Points are locked until the market order completes. You will be notified when gold is credited.`,
        );
      } else {
        setSuccess(`Purchased ${goldGm} g with Bounz points.`);
      }
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Buy failed';
      notifyBuyTransaction({ success: false, goldGm, error: String(message) });
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const isFundOrCard = tradePaymentMethod === 'fund_or_card';
  const tradePaymentNote = BOUNZ_TRADE_PAYMENT_NOTES[tradePaymentMethod];

  const footer = (
    <>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => navigation.navigate('TradeHistory')}>
            <Text style={styles.historyLinkText}>View purchase history</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {isFundOrCard ? (
        <TouchableOpacity
          style={ls.button}
          onPress={() => navigation.navigate('BuyGold')}>
          <Text style={ls.buttonText}>Continue to fund & card buy</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            ls.button,
            (loading || !quote || !kycOk || !canBuy || !marketOpen) &&
              ls.buttonDisabled,
          ]}
          onPress={handleBuy}
          disabled={
            loading ||
            !quote ||
            !kycOk ||
            !canBuy ||
            !marketOpen ||
            maintenanceActive
          }>
          {loading ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={ls.buttonText}>Confirm buy with points</Text>
          )}
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />
      <SdkScreenLayout
        variant="cream"
        fill
        subtitle="Buy with Bounz points or fund & card · prices in AED"
        footer={footer}>
        <View style={styles.row}>
          <MarketPriceCard compact />
          <View style={styles.gap} />
          <PointsGoldCard
            pointBalance={profile?.pointBalance}
            pointsPerAed={pointsPerAed}
          />
        </View>

        {maintenanceActive ? (
          <MaintenanceModeBanner message={maintenanceMessage} />
        ) : null}

        <OrderStatusBanner banner={orderBanner} onDismiss={dismissBanner} />
        {!kycOk ? (
          <SdkNote variant="warn">
            KYC must be Approved before you can buy gold. Go to the KYC section
            on your dashboard.
          </SdkNote>
        ) : null}
        {!marketOpen ? (
          <SdkNote variant="warn">
            Market is currently closed. Buying with Bounz points is disabled
            until the market reopens.
          </SdkNote>
        ) : null}
        <BuyGoldPaymentPicker
          methods={BOUNZ_TRADE_PAYMENT_METHODS}
          value={tradePaymentMethod}
          onChange={setTradePaymentMethod}
          note={tradePaymentNote}
        />

        {isFundOrCard ? (
          <SdkNote>
            Fund balance and card payments use the Buy Gold screen — a
            separate checkout from Bounz points.
          </SdkNote>
        ) : (
          <SdkNote>
            Minimum purchase {buyMinGm}g
            {maxBuyGoldGm != null ? ` · maximum ${maxBuyGoldGm}g` : ''}.
          </SdkNote>
        )}

        {!isFundOrCard ? (
          <>
        <Text style={ls.label}>Grams to buy</Text>
        <TextInput
          style={[ls.input, styles.inputCream]}
          value={grams}
          onChangeText={setGrams}
          keyboardType="decimal-pad"
          placeholder={String(buyMinGm)}
          placeholderTextColor="#9CA3AF"
        />

        <View style={[ls.card, ls.cardCream]}>
          {quote ? (
            <>
              <InfoRow
                label="Points required"
                value={quote.pointsRequired}
                variant="cream"
              />
              <InfoRow
                label="AED estimate"
                value={
                  quote.aedAmount != null
                    ? formatAed(quote.aedAmount, 2)
                    : '—'
                }
                variant="cream"
              />
            </>
          ) : (
            <Text style={ls.hint}>
              Enter between {buyMinGm}g
              {maxBuyGoldGm != null ? ` and ${maxBuyGoldGm}g` : ''} with a live
              market price to see your quote.
            </Text>
          )}
        </View>
          </>
        ) : null}
      </SdkScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gap: {
    width: 10,
  },
  inputCream: {
    backgroundColor: SDK_COLORS.cardCream,
    borderColor: SDK_COLORS.borderCream,
    color: SDK_COLORS.textDark,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  successText: {
    color: '#15803D',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  historyLink: {
    marginTop: 8,
    alignItems: 'center',
  },
  historyLinkText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
