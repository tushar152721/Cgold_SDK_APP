import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { requireConfig } from '../configStore';
import { sdkApi } from '../api/client';
import { SDK_COLORS } from '../constants';
import { layoutCardStyles as ls } from '../components/SdkScreenLayout';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import SdkNote from '../components/SdkNote';
import ComtechGoldCopyrightFooter from '../components/ComtechGoldCopyrightFooter';
import { useSdkCurrency } from '../context/SdkCurrencyContext';
import { useSdkToast } from '../context/SdkToastContext';
import SdkStatementSummaryCards from '../components/statement/SdkStatementSummaryCards';
import SdkStatementDateRangeModal from '../components/statement/SdkStatementDateRangeModal';
import SdkStatementTransactionCard from '../components/statement/SdkStatementTransactionCard';
import {
  STATEMENT_FILTERS,
  buildStatementQueryParams,
  mapStatementAuditItem,
  parseStatementResponse,
  sortStatementItemsNewestFirst,
  statementStaticPdfUrl,
} from '../utils/statementHistory';

const INITIAL_VISIBLE = 5;

export default function StatementHistoryScreen() {
  const config = requireConfig();
  const { formatAed } = useSdkCurrency();
  const { showToast } = useSdkToast();

  const [items, setItems] = useState([]);
  const [opening, setOpening] = useState(null);
  const [closing, setClosing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(null);
  const [monthDate] = useState(() => new Date());

  const loadStatement = useCallback(async (overrides = {}) => {
    if (!config.userToken) {
      setLoading(false);
      return;
    }

    setError(null);

    try {
      const activeStart =
        'startDate' in overrides ? overrides.startDate : startDate;
      const activeEnd = 'endDate' in overrides ? overrides.endDate : endDate;
      const activeFilter = 'filter' in overrides ? overrides.filter : filter;

      const params = buildStatementQueryParams({
        monthDate,
        startDate: activeStart,
        endDate: activeEnd,
        filter: activeFilter,
      });
      const res = await sdkApi.getStatementAudits(params);
      const parsed = parseStatementResponse(res);
      const mapped = parsed.items.map(mapStatementAuditItem);
      setItems(sortStatementItemsNewestFirst(mapped));
      setOpening(parsed.opening);
      setClosing(parsed.closing);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not load statement history',
      );
      setItems([]);
      setOpening(null);
      setClosing(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [config.userToken, monthDate, startDate, endDate, filter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadStatement();
    }, [loadStatement]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStatement();
  };

  const handleFilterChange = tab => {
    if (tab === filter) {
      return;
    }
    setFilter(tab);
    setShowAll(false);
    setLoading(true);
    loadStatement({ filter: tab });
  };

  const handleQuickFilter = (days, key) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - days);
    setStartDate(start);
    setEndDate(today);
    setSelectedQuickFilter(key);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedQuickFilter(null);
    setShowAll(false);
    setLoading(true);
    loadStatement({ startDate: null, endDate: null });
  };

  const handleDownloadPdf = async () => {
    if (!config.userToken || downloading) {
      return;
    }

    setDownloading(true);
    try {
      const params = buildStatementQueryParams({
        monthDate,
        startDate,
        endDate,
        filter,
      });
      const res = await sdkApi.getStatementPdf(params);
      const filename = res?.data?.data;
      const url = statementStaticPdfUrl(config.apiBaseUrl, filename);

      if (!url) {
        throw new Error('PDF file was not returned');
      }

      if (Platform.OS === 'ios') {
        await Share.share({ url, title: 'Statement PDF' });
        showToast('PDF ready — save from the share sheet', { type: 'success' });
      } else {
        await Linking.openURL(url);
        showToast('Opening statement PDF…', { type: 'success' });
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Could not download statement',
        { type: 'error', duration: 5000 },
      );
    } finally {
      setDownloading(false);
    }
  };

  const displayedItems = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const showFundNote = filter === 'Fund' || filter === 'All';
  const showDownload = filter === 'Fund' || filter === 'All';
  const hasCustomRange = Boolean(startDate && endDate);

  const listHeader = (
    <View style={styles.headerBlock}>
      <SdkStatementSummaryCards
        opening={opening}
        closing={closing}
        formatAed={formatAed}
      />

      <View style={styles.listSection}>
        <View style={styles.listSectionHeader}>
          <Text style={styles.sectionTitle}>
            List of <Text style={styles.sectionHighlight}>statements</Text>
          </Text>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.segmentedControl}>
            {STATEMENT_FILTERS.map((tab, index) => {
              const isActive = filter === tab;
              const isFirst = index === 0;
              const isLast = index === STATEMENT_FILTERS.length - 1;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.segmentBtn,
                    isFirst && styles.segmentBtnFirst,
                    isLast && styles.segmentBtnLast,
                    isActive && styles.segmentBtnActive,
                  ]}
                  onPress={() => handleFilterChange(tab)}>
                  <Text
                    style={[
                      styles.segmentText,
                      isActive && styles.segmentTextActive,
                    ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}>
            <Text style={styles.filterIcon}>☰</Text>
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rangeRow}>
          {hasCustomRange ? (
            <>
              <Text style={styles.rangeLabel}>
                {startDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}{' '}
                –{' '}
                {endDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={clearDateFilter}>
                <Text style={styles.clearRange}>Clear</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.rangeLabel}>
              Current month · tap Filter for a custom range
            </Text>
          )}
        </View>

        {showDownload ? (
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
            onPress={handleDownloadPdf}
            disabled={downloading || items.length === 0}>
            {downloading ? (
              <ActivityIndicator size="small" color="#1A1A1A" />
            ) : (
              <>
                <Text style={styles.downloadIcon}>↓</Text>
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={ls.linkButton} onPress={loadStatement}>
              <Text style={ls.linkText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading && items.length === 0 ? (
          <ActivityIndicator color={SDK_COLORS.primary} style={styles.loader} />
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />
      <FlatList
        data={displayedItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SdkStatementTransactionCard
            title={item.title}
            date={item.date}
            transactionType={item.transactionType}
            amountDisplay={
              item.isFund || !item.isGold
                ? formatAed(Number(item.amountLabel), 2)
                : item.amountLabel
            }
            priceHint={item.priceHint}
            transactionNumber={item.transactionNumber}
            balanceLabel={item.balanceLabel}
            balanceValue={
              item.isFund
                ? formatAed(Number(item.balanceValue), 2)
                : item.balanceValue
            }
            status={item.status}
          />
        )}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconBox}>
                <Text style={styles.emptyIcon}>📄</Text>
              </View>
              <Text style={styles.empty}>No active statements</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {items.length > INITIAL_VISIBLE ? (
              <TouchableOpacity
                style={styles.viewMoreBtn}
                onPress={() => setShowAll(prev => !prev)}>
                <Text style={styles.viewMoreText}>
                  {showAll ? 'View less' : `View more (${items.length})`}
                </Text>
                <Text style={styles.viewMoreChevron}>
                  {showAll ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            ) : null}
            <ComtechGoldCopyrightFooter variant="cream" />
          </>
        }
        contentContainerStyle={styles.list}
      />

      <SdkStatementDateRangeModal
        visible={filterVisible}
        startDate={startDate}
        endDate={endDate}
        selectedQuickFilter={selectedQuickFilter}
        onClose={() => setFilterVisible(false)}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onQuickFilter={handleQuickFilter}
        onDone={() => {
          if (startDate && endDate) {
            setFilterVisible(false);
            setShowAll(false);
            setLoading(true);
            loadStatement();
          }
        }}
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
    paddingTop: 0,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: 8,
  },
  listSection: {
    paddingTop: 4,
  },
  listSectionHeader: {
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  sectionHighlight: {
    color: SDK_COLORS.primary,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  segmentedControl: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentBtnFirst: {},
  segmentBtnLast: {},
  segmentBtnActive: {
    backgroundColor: SDK_COLORS.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    backgroundColor: SDK_COLORS.cardCream,
  },
  filterIcon: {
    fontSize: 12,
    marginRight: 4,
    color: SDK_COLORS.primaryDark,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rangeLabel: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    flex: 1,
  },
  clearRange: {
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.primaryDark,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 4,
    marginBottom: 12,
    minWidth: 180,
    justifyContent: 'center',
  },
  downloadBtnDisabled: {
    opacity: 0.6,
  },
  downloadIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 6,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  loader: {
    marginVertical: 24,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F4D287',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    opacity: 0.7,
  },
  emptyIcon: {
    fontSize: 24,
  },
  empty: {
    color: SDK_COLORS.textMutedDark,
    fontSize: 14,
    textAlign: 'center',
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
  viewMoreBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: SDK_COLORS.primaryDark,
    marginRight: 4,
  },
  viewMoreChevron: {
    fontSize: 10,
    color: SDK_COLORS.primaryDark,
  },
});
