import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

/**
 * Gold holdings + live price summary (no historical chart API in SDK).
 */
export default function DashboardGoldValueSection({
  goldGm,
  pricePerGram,
  marketOpen,
  estimatedValue,
}) {
  const goldText =
    goldGm != null && goldGm !== ''
      ? `${Number(goldGm).toFixed(2)}g`
      : '—';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>My Gold & Value (per gram)</Text>
          {marketOpen ? (
            <Text style={styles.liveTag}>Live</Text>
          ) : (
            <Text style={styles.closedTag}>Market closed</Text>
          )}
        </View>
        <View style={styles.periodPill}>
          <Text style={styles.periodText}>Live</Text>
        </View>
      </View>

      <Text style={styles.goldBig}>{goldText}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Price / gram</Text>
          <Text style={styles.metaValue}>{pricePerGram ?? '—'}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Est. gold value</Text>
          <Text style={styles.metaValue}>{estimatedValue ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.chartPlaceholder}>
        <View style={styles.chartFill} />
        <Text style={styles.chartNote}>
          Live market price updates while the exchange is open.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  liveTag: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  closedTag: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
  periodPill: {
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFBF5',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  goldBig: {
    fontSize: 28,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metaBlock: {
    flex: 1,
  },
  metaDivider: {
    width: 1,
    backgroundColor: SDK_COLORS.borderCream,
    marginHorizontal: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: SDK_COLORS.primaryDark,
  },
  chartPlaceholder: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F4EA',
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    justifyContent: 'flex-end',
  },
  chartFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderTopWidth: 2,
    borderTopColor: SDK_COLORS.primary,
    top: '35%',
  },
  chartNote: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    padding: 10,
    textAlign: 'center',
  },
});
