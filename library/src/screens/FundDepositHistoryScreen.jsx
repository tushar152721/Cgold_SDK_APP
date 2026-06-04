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
import {
  parseDepositFundHistoryResponse,
  fundDepositHistoryTitle,
  fundDepositHistoryStatus,
  fundDepositHistoryMeta,
  mapFundDepositDoc,
} from '../utils/fundDepositHistory';

export default function FundDepositHistoryScreen() {
  const config = requireConfig();
  const { formatAed } = useSdkCurrency();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(
    async (pageNum, append) => {
      if (!config.userToken) {
        setLoading(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await sdkApi.getDepositFundHistory(pageNum, 20);
        const { docs, page: currentPage, totalPages: pages } =
          parseDepositFundHistoryResponse(res);
        const mapped = docs.map(mapFundDepositDoc);

        setItems(prev => (append ? prev.concat(mapped) : mapped));
        setPage(currentPage);
        setTotalPages(pages);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            'Could not load fund deposit history',
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

  const formatDepositAmount = (item) => {
    const amount = Number(item?.amount);
    const currency = item?.currency || 'AED';
    if (!Number.isFinite(amount)) {
      return '—';
    }
    if (currency === 'USD') {
      return `$ ${amount.toFixed(2)}`;
    }
    return formatAed(amount, 2);
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <SdkNote>
        Pending deposits are waiting for admin approval. Approved deposits are
        added to your fund balance.
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
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SdkHistoryListCard
            title={fundDepositHistoryTitle(item)}
            date={item.createdAt || item.date}
            amountLabel={formatDepositAmount(item)}
            status={fundDepositHistoryStatus(item)}
            meta={fundDepositHistoryMeta(item)}
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
            <Text style={styles.empty}>No fund deposits yet.</Text>
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
