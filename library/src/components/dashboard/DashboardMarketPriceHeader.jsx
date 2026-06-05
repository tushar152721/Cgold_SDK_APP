import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function DashboardMarketPriceHeader({
  pricePerGram,
  marketOpen = true,
  pointsLabel,
  refreshing = false,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />

      {refreshing ? (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="small" color={SDK_COLORS.primary} />
          <Text style={styles.refreshText}>Refreshing live price…</Text>
        </View>
      ) : null}

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
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.primary,
    padding: 18,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: SDK_COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
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
    fontSize: 15,
    color: SDK_COLORS.textDark,
    fontWeight: '600',
  },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    letterSpacing: -0.5,
    paddingLeft: 4,
  },
  perGram: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
    paddingLeft: 4,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: 4,
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
    paddingLeft: 4,
  },
  refreshOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderRadius: 16,
  },
  refreshText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
});
