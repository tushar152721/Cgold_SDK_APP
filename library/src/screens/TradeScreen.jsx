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
  getSellMinGoldGm,
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
  const initialMode = route?.params?.mode === 'sell' ? 'sell' : 'buy';

  const [mode, setMode] = useState(initialMode);
  const [pointsPerAed, setPointsPerAed] = useState(200);
  const [grams, setGrams] = useState(String(getBuyMinGoldGm()));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
  const isBuy = mode === 'buy';

  const maxBuyGoldGm = useMemo(() => {
    if (!isBuy) {
      return null;
    }
    const fromPoints = estimateMaxGoldFromPoints(
      profile?.pointBalance,
      price?.buyGm,
      pointsPerAed,
    );
    return getEffectiveBuyMaxGoldGm(fromPoints);
  }, [isBuy, profile?.pointBalance, price?.buyGm, pointsPerAed]);

  /** Recalculated locally when grams or socket price changes — no /trade/quote calls. */
  const quote = useMemo(() => {
    if (!isBuy) {
      return null;
    }
    return quotePointsForGold(
      grams,
      price?.buyGm,
      pointsPerAed,
      getBuyMinGoldGm(),
      maxBuyGoldGm,
    );
  }, [grams, price?.buyGm, isBuy, pointsPerAed, maxBuyGoldGm]);

  const buyMinGm = getBuyMinGoldGm();
  const sellMinGm = getSellMinGoldGm();

  useEffect(() => {
    if (isBuy) {
      setGrams(g => {
        const n = parseFloat(g);
        if (!g || Number.isNaN(n) || n < buyMinGm) {
          return String(buyMinGm);
        }
        return g;
      });
    }
  }, [isBuy, buyMinGm]);

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
      notifyBuyTransaction({ success: true, goldGm, response: res });
      if (orderStatus === 'Pending') {
        setSuccess(
          `Order placed successfully for ${goldGm} g. Points are locked until the market order completes. You will be notified when gold is credited.`,
        );
      } else {
        setSuccess(`Purchased ${goldGm} g with Bounz points.`);
      }
      await loadProfile({ force: true });
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

  const footer = isBuy ? (
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
    </>
  ) : null;

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />
      <SdkScreenLayout
        variant="cream"
        fill
        subtitle="Trade using Bounz points · prices in AED"
        footer={footer}>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, isBuy && styles.toggleActive]}
            onPress={() => setMode('buy')}>
            <Text style={[styles.toggleText, isBuy && styles.toggleTextActive]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, !isBuy && styles.toggleActive]}
            onPress={() => setMode('sell')}>
            <Text style={[styles.toggleText, !isBuy && styles.toggleTextActive]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

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

        {isBuy ? (
          <>
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
            <SdkNote>
              Minimum purchase {buyMinGm}g
              {maxBuyGoldGm != null ? ` · maximum ${maxBuyGoldGm}g` : ''}. Points
              are locked at checkout through ClubClass.
            </SdkNote>

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
        ) : (
          <>
            <SdkNote variant="warn">
              Sell gold via Bounz SDK is not available yet (minimum {sellMinGm}g in
              the ComTech Gold app). Use the main app
              for sell flows, or check back in a future release.
            </SdkNote>
            <View style={[ls.card, ls.cardCream]}>
              <InfoRow
                label="Your gold balance"
                value={
                  profile?.user?.goldTotal != null
                    ? `${profile.user.goldTotal} g`
                    : '—'
                }
                variant="cream"
              />
            </View>
          </>
        )}
      </SdkScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E8E0D4',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: SDK_COLORS.primary,
  },
  toggleText: {
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
  toggleTextActive: {
    color: '#1A1A1A',
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
