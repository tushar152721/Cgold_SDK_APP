import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function DashboardGoldHoldingsCard({ goldGm, valueHint }) {
  const goldText =
    goldGm != null && goldGm !== ''
      ? `${Number(goldGm).toFixed(2)}g`
      : '—';

  return (
    <View style={styles.card}>
      <View style={styles.textCol}>
        <Text style={styles.label}>My Gold Holdings</Text>
        <Text style={styles.gold}>{goldText}</Text>
        {valueHint ? <Text style={styles.hint}>{valueHint}</Text> : null}
      </View>
   
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.primary,
    padding: 18,
    marginBottom: 14,
    minHeight: 100,
    shadowColor: SDK_COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
    marginBottom: 8,
  },
  gold: {
    fontSize: 32,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
  },
  art: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    fontSize: 44,
  },
});
