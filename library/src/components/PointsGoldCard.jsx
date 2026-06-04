import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import { useSdkPrice } from '../context/SdkPriceContext';
import { estimateMaxGoldFromPoints } from '../utils/tradeEstimate';

export default function PointsGoldCard({ pointBalance, pointsPerAed }) {
  const { price } = useSdkPrice();
  /** Matches backend `quotePointsForGold` / trade buy (global.buyGm). */
  const buyGmAed = price?.buyGm != null ? Number(price.buyGm) : null;
  const maxGold = estimateMaxGoldFromPoints(
    pointBalance,
    buyGmAed,
    pointsPerAed,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Bounz points</Text>
      <Text style={styles.points}>
        {pointBalance != null ? Number(pointBalance).toLocaleString() : '—'}
      </Text>
      <Text style={styles.sub}>Available to redeem</Text>
      <View style={styles.divider} />
      <Text style={styles.goldLabel}>You can buy up to</Text>
      <Text style={styles.goldValue}>
        {maxGold != null ? `${maxGold} g` : '—'}
      </Text>
      <Text style={styles.goldHint}>at current market price (estimate)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    minHeight: 120,
  },
  label: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  points: {
    fontSize: 22,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginTop: 6,
  },
  sub: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: SDK_COLORS.borderCream,
    marginVertical: 10,
  },
  goldLabel: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
  },
  goldValue: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.primaryDark,
    marginTop: 4,
  },
  goldHint: {
    fontSize: 10,
    color: SDK_COLORS.textMutedDark,
    marginTop: 4,
  },
});
