import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { requireConfig } from '../configStore';
import { SDK_COLORS } from '../constants';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import KycOutcomeCard from '../components/KycOutcomeCard';
import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';
import DashboardMarketPriceHeader from '../components/dashboard/DashboardMarketPriceHeader';
import DashboardAvailableBalanceCard from '../components/dashboard/DashboardAvailableBalanceCard';
import DashboardGoldHoldingsCard from '../components/dashboard/DashboardGoldHoldingsCard';
import DashboardGridTile from '../components/dashboard/DashboardGridTile';
import DashboardKycCard from '../components/dashboard/DashboardKycCard';
import { normalizeKycStatus } from '../utils/kycFlow';
import { loadSdkProfile, clearProfileCache } from '../utils/profileCache';
import { refreshSdkMarketPrice } from '../utils/sdkPriceSocket';
import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { useSdkPrice } from '../context/SdkPriceContext';
import { usePendingBuyPoller } from '../hooks/usePendingBuyPoller';
import OrderStatusBanner from '../components/OrderStatusBanner';
import MaintenanceModeBanner from '../components/MaintenanceModeBanner';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';
import {
  subscribeDashboardGoldRefresh,
  hasPendingDashboardGoldRefresh,
  clearPendingDashboardGoldRefresh,
} from '../utils/dashboardRefreshBus';

export default function SdkHomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const config = requireConfig();
  const { formatAed, formatMarketGoldRate, getMarketGoldRate } = useSdkCurrency();
  const { price } = useSdkPrice();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [goldBalanceRefreshing, setGoldBalanceRefreshing] = useState(false);
  const { banner: orderBanner, dismissBanner } = usePendingBuyPoller({
    enabled: Boolean(config.userToken),
  });
  const { active: maintenanceActive, message: maintenanceMessage } =
    useMaintenanceMode();
  const isFocusedRef = useRef(false);
  const goldRefreshInFlightRef = useRef(false);

  const kycOutcome = route.params?.kycOutcome;
  const kycStatusParam = route.params?.kycStatus;
  const kycComments = route.params?.kycComments;

  const refresh = useCallback(
    async (force = false) => {
      if (!config.userToken) {
        setLoading(false);
        return;
      }
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setLoadError(null);
      try {
        if (force) {
          clearProfileCache();
          await refreshSdkMarketPrice();
        }
        const data = await loadSdkProfile({
          force: force || Boolean(route.params?.kycRefresh),
        });
        setProfile(data);
      } catch (err) {
        setLoadError(
          err?.response?.data?.error ||
            err?.message ||
            'Could not load dashboard.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [config.userToken, route.params?.kycRefresh],
  );

  useEffect(() => {
    if (config.userToken) {
      refresh(false);
    } else {
      setLoading(false);
    }
  }, [config.userToken, refresh]);

  const refreshAfterGoldCredit = useCallback(async () => {
    if (!config.userToken || goldRefreshInFlightRef.current) {
      return;
    }
    goldRefreshInFlightRef.current = true;
    setGoldBalanceRefreshing(true);
    setLoadError(null);
    try {
      clearProfileCache();
      await refreshSdkMarketPrice();
      const data = await loadSdkProfile({ force: true });
      setProfile(data);
      clearPendingDashboardGoldRefresh();
    } catch (err) {
      setLoadError(
        err?.response?.data?.error ||
          err?.message ||
          'Could not refresh dashboard.',
      );
    } finally {
      goldRefreshInFlightRef.current = false;
      setGoldBalanceRefreshing(false);
    }
  }, [config.userToken]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      if (route.params?.kycRefresh && config.userToken) {
        refresh(true);
      } else if (hasPendingDashboardGoldRefresh() && config.userToken) {
        refreshAfterGoldCredit();
      }
      return () => {
        isFocusedRef.current = false;
      };
    }, [
      route.params?.kycRefresh,
      config.userToken,
      refresh,
      refreshAfterGoldCredit,
    ]),
  );

  useEffect(() => {
    const unsubscribe = subscribeDashboardGoldRefresh(() => {
      if (isFocusedRef.current) {
        refreshAfterGoldCredit();
      }
    });
    return unsubscribe;
  }, [refreshAfterGoldCredit]);

  const user = profile?.user || {};
  const kycStatus = profile?.kycStatus ?? kycStatusParam ?? '—';
  const kycNorm = normalizeKycStatus(kycStatus);
  const kycOk = kycNorm === 'approved' || kycStatus === 'Approved';
  const canBuy = profile?.canUseBounzPoints === true;
  const showOutcome = Boolean(kycOutcome);
  const marketOpen = Boolean(price?.isMarket);
  const buyGm = price?.buyGm;
  const goldGm = user.goldTotal;
  const fundBalance = user.fundTotal;

  const pricePerGram =
    buyGm != null ? formatMarketGoldRate(buyGm, 2) : null;

  const estimatedGoldValue = useMemo(() => {
    if (goldGm == null || buyGm == null) {
      return null;
    }
    const rate = getMarketGoldRate(buyGm);
    const total = Number(goldGm) * rate;
    if (!Number.isFinite(total)) {
      return null;
    }
    return formatAed(total, 2);
  }, [goldGm, buyGm, getMarketGoldRate, formatAed]);

  const pointsLabel =
    profile?.pointBalance != null
      ? `Bounz points · ${Number(profile.pointBalance).toLocaleString()}`
      : null;

  const buyGoldDisabled = !config.userToken || !kycOk;
  const pointsBuyDisabled = !config.userToken || !canBuy || !kycOk;
  const buyGoldSubtitle = !kycOk ? 'Do KYC first' : 'Fund balance or card';
  const pointsBuySubtitle = !kycOk
    ? 'Do KYC first'
    : !canBuy
      ? 'Points unavailable'
      : 'Bounz points';

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />

      {loading && !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={SDK_COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh(true)}
              tintColor={SDK_COLORS.primary}
            />
          }>
          <View style={styles.body}>
            <OrderStatusBanner
              banner={orderBanner}
              onDismiss={dismissBanner}
            />

            {maintenanceActive ? (
              <MaintenanceModeBanner message={maintenanceMessage} />
            ) : null}

            <DashboardKycCard
              status={kycStatus}
              onPress={() => navigation.navigate('Kyc')}
            />

            {showOutcome && !kycOk ? (
              <KycOutcomeCard
                outcome={kycOutcome}
                status={kycStatus}
                comments={kycComments}
              />
            ) : null}

            {loadError ? (
              <View style={styles.warnBox}>
                <Text style={styles.warnText}>{loadError}</Text>
              </View>
            ) : null}

            <DashboardMarketPriceHeader
              pricePerGram={pricePerGram}
              marketOpen={marketOpen}
              pointsLabel={pointsLabel}
              refreshing={goldBalanceRefreshing}
            />

            <DashboardAvailableBalanceCard
              balanceLabel={
                fundBalance != null ? formatAed(fundBalance, 2) : null
              }
              refreshing={goldBalanceRefreshing || refreshing}
              onPress={
                config.userToken
                  ? () => navigation.navigate('AddFund')
                  : undefined
              }
            />

            <DashboardGoldHoldingsCard
              goldGm={goldGm}
              valueHint={
                estimatedGoldValue
                  ? `≈ ${estimatedGoldValue} at live price`
                  : null
              }
              refreshing={goldBalanceRefreshing}
            />

            <DashboardGridTile
              title="Add funds"
              subtitle="Deposit via bank or card"
              fullWidth
              onPress={() => navigation.navigate('AddFund')}
              disabled={!config.userToken}
            />

            <View style={styles.gridRow}>
              <DashboardGridTile
                title="Buy gold"
                subtitle={buyGoldSubtitle}
                onPress={() => navigation.navigate('BuyGold')}
                disabled={buyGoldDisabled}
              />
              <View style={styles.gridGap} />
              <DashboardGridTile
                title="Buy with points"
                subtitle={pointsBuySubtitle}
                onPress={() => navigation.navigate('Trade', { mode: 'buy' })}
                disabled={pointsBuyDisabled}
              />
            </View>

            <DashboardGridTile
              title="Sell gold"
              subtitle={marketOpen ? 'Coming soon' : 'Market closed'}
              fullWidth
              disabled={true}
            />

            <DashboardGridTile
              title="Trade history"
              subtitle="Past point purchases"
              fullWidth
              onPress={() => navigation.navigate('TradeHistory')}
              disabled={!config.userToken}
            />

            <DashboardGridTile
              title="Fund history"
              subtitle="Deposit requests & status"
              fullWidth
              onPress={() => navigation.navigate('FundDepositHistory')}
              disabled={!config.userToken}
            />

            <DashboardGridTile
              title="Statement history"
              subtitle="Gold & fund statements"
              fullWidth
              onPress={() => navigation.navigate('StatementHistory')}
              disabled={!config.userToken}
            />
          </View>

          <View style={styles.footer}>
            <ComtechGoldCopyrightFooter variant="cream" />
          </View>
        </ScrollView>
      )}
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gridGap: {
    width: 12,
  },
  warnBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warnText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
});
