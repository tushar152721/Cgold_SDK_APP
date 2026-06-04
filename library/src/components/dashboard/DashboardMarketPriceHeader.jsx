import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function DashboardMarketPriceHeader({
  pricePerGram,
  marketOpen = true,
  pointsLabel,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, marketOpen ? styles.dotOpen : styles.dotClosed]} />
        <Text style={styles.label}>Market price · AED</Text>
      </View>
      <Text style={styles.amount}>{pricePerGram ?? '—'}</Text>
      <Text style={styles.perGram}>per gram</Text>
      <Text style={[styles.status, marketOpen ? styles.statusOpen : styles.statusClosed]}>
        {marketOpen ? 'Market open · live updates' : 'Market closed'}
      </Text>
      {pointsLabel ? (
        <Text style={styles.points}>{pointsLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotOpen: {
    backgroundColor: SDK_COLORS.success,
  },
  dotClosed: {
    backgroundColor: '#9CA3AF',
  },
  label: {
    fontSize: 14,
    color: SDK_COLORS.textMutedDark,
    fontWeight: '600',
  },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    letterSpacing: -0.5,
  },
  perGram: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  statusOpen: {
    color: '#15803D',
  },
  statusClosed: {
    color: SDK_COLORS.textMutedDark,
  },
  points: {
    marginTop: 8,
    fontSize: 14,
    color: SDK_COLORS.primaryDark,
    fontWeight: '600',
  },
});
