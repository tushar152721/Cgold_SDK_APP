import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function DashboardAvailableBalanceCard({
  balanceLabel,
  onPress,
  refreshing = false,
}) {
  const content = (
    <>
      {refreshing ? (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="small" color={SDK_COLORS.primary} />
          <Text style={styles.refreshText}>Updating balance…</Text>
        </View>
      ) : null}
      <View style={styles.labelRow}>
        <View style={styles.liveDot} />
        <Text style={styles.label}>Available My Balance</Text>
      </View>
      <Text style={styles.balance}>{balanceLabel ?? '—'}</Text>
      <Text style={styles.hint}>Use for buy gold or add more funds</Text>
    </>
  );

  if (typeof onPress === 'function') {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Available my balance, add funds">
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.primary,
    padding: 18,
    marginBottom: 14,
    minHeight: 96,
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
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SDK_COLORS.success,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
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
