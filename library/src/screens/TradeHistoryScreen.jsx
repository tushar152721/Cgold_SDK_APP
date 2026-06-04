import React, { useCallback, useState } from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  FlatList,

  ActivityIndicator,

  StyleSheet,

  RefreshControl,

} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { requireConfig } from '../configStore';

import { sdkApi } from '../api/client';

import { SDK_COLORS } from '../constants';

import { layoutCardStyles as ls } from '../components/SdkScreenLayout';

import ComtechGoldHeader from '../components/ComtechGoldHeader';

import SdkHistoryListCard from '../components/SdkHistoryListCard';

import SdkNote from '../components/SdkNote';

import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';

import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { processTradeHistoryForNotifications } from '../utils/buyOrderNotifications';
import { usePendingBuyPoller } from '../hooks/usePendingBuyPoller';
import OrderStatusBanner from '../components/OrderStatusBanner';



function historyTitle(item) {
  if (item.buyStatus === 'Rejected') {
    return 'Buy not completed';
  }
  if (item.status === 'locked' || item.buyStatus === 'Pending') {
    return 'Buy processing';
  }
  if (item.buyOrderId || item.status === 'redeemed') {
    return 'Gold purchased';
  }
  return 'Bounz points buy';
}

function historyDisplayStatus(item) {
  if (item.buyStatus === 'Completed' || item.status === 'redeemed') {
    return 'redeemed';
  }
  if (item.buyStatus === 'Rejected') {
    return 'released';
  }
  if (item.status === 'locked' || item.buyStatus === 'Pending') {
    return 'locked';
  }
  return item.status;
}



function historyMeta(item, formatAed) {

  const parts = [];

  if (item.points) {

    parts.push(`${item.points} pts`);

  }

  const aed =

    item.amountAed != null

      ? formatAed(Number(item.amountAed), 2)

      : item.buyAedAmount != null

        ? formatAed(Number(item.buyAedAmount), 2)

        : null;

  if (aed) {

    parts.push(aed);

  }

  return parts.length ? parts.join(' · ') : null;

}



export default function TradeHistoryScreen() {

  const config = requireConfig();

  const { formatAed } = useSdkCurrency();

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [loadingMore, setLoadingMore] = useState(false);

  const { banner: orderBanner, dismissBanner } = usePendingBuyPoller({
    enabled: Boolean(config.userToken),
  });

  const loadPage = useCallback(

    async (pageNum, append) => {

      if (!config.userToken) {

        setLoading(false);

        return;

      }

      if (append) {

        setLoadingMore(true);

      } else if (!append && pageNum === 1) {

        setLoading(true);

      }

      setError(null);

      try {

        const res = await sdkApi.getTradeHistory({ page: pageNum, limit: 20 });

        const apiBody = res?.data ?? {};

        const data = apiBody.data ?? apiBody;

        const next = data.items ?? [];

        setItems(prev => (append ? prev.concat(next) : next));

        if (!append) {
          processTradeHistoryForNotifications(next);
        }

        setPage(data.page ?? pageNum);

        setTotalPages(data.totalPages ?? 0);

      } catch (err) {

        setError(

          err?.response?.data?.error ||

            err?.message ||

            'Could not load purchase history',

        );

        if (!append) {

          setItems([]);

        }

      } finally {

        setLoading(false);

        setRefreshing(false);

        setLoadingMore(false);

      }

    },

    [config.userToken],

  );



  useFocusEffect(

    useCallback(() => {

      loadPage(1, false);

    }, [loadPage]),

  );



  const onRefresh = () => {

    setRefreshing(true);

    loadPage(1, false);

  };



  const onEndReached = () => {

    if (loadingMore || loading || page >= totalPages) {

      return;

    }

    loadPage(page + 1, true);

  };



  const listHeader = (

    <View style={styles.headerBlock}>

      <OrderStatusBanner banner={orderBanner} onDismiss={dismissBanner} />

      <SdkNote>

        Processing means points are locked until the hedge order completes.

        Approved means gold was credited and points were redeemed.

      </SdkNote>

      {error ? (

        <View style={styles.errorBox}>

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={ls.linkButton} onPress={() => loadPage(1, false)}>

            <Text style={ls.linkText}>Try again</Text>

          </TouchableOpacity>

        </View>

      ) : null}

      {loading && items.length === 0 ? (

        <ActivityIndicator color={SDK_COLORS.primary} style={styles.loader} />

      ) : null}

    </View>

  );



  return (

    <View style={styles.root}>

      <ComtechGoldHeader compact />

      <FlatList

        data={items}

        keyExtractor={item => String(item.id)}

        renderItem={({ item }) => (

          <SdkHistoryListCard

            title={historyTitle(item)}

            date={item.redeemedAt || item.createdAt}

            amountGm={item.goldGm}

            status={historyDisplayStatus(item)}

            meta={historyMeta(item, formatAed)}

          />

        )}

        ListHeaderComponent={listHeader}

        refreshControl={

          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

        }

        onEndReached={onEndReached}

        onEndReachedThreshold={0.3}

        ListEmptyComponent={

          !loading ? (

            <Text style={styles.empty}>No purchases yet.</Text>

          ) : null

        }

        ListFooterComponent={

          <>

            {loadingMore ? (

              <ActivityIndicator color={SDK_COLORS.primary} style={styles.footer} />

            ) : null}

            <ComtechGoldCopyrightFooter variant="cream" />

          </>

        }

        contentContainerStyle={styles.list}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  root: {

    flex: 1,

    backgroundColor: SDK_COLORS.backgroundCream,

  },

  list: {

    paddingHorizontal: 16,

    paddingTop: 8,

    paddingBottom: 32,

    flexGrow: 1,

  },

  headerBlock: {

    marginBottom: 8,

  },

  loader: {

    marginVertical: 24,

  },

  empty: {

    color: SDK_COLORS.textMutedDark,

    fontSize: 14,

    textAlign: 'center',

    marginTop: 24,

  },

  errorBox: {

    backgroundColor: '#FEF2F2',

    borderRadius: 8,

    padding: 12,

    marginBottom: 12,

  },

  errorText: {

    color: '#991B1B',

    fontSize: 13,

    textAlign: 'center',

    marginBottom: 8,

  },

  footer: {

    marginVertical: 12,

  },

});

