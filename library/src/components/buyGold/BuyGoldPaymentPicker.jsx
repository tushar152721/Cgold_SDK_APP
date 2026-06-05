import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';
import {
  CardPaymentIcon,
  WalletBalanceIcon,
} from '../fund/PaymentMethodIcons';

const OUTER = 72;
const INNER = 60;

const ICONS = {
  card: CardPaymentIcon,
  wallet: WalletBalanceIcon,
};

export default function BuyGoldPaymentPicker({
  methods,
  value,
  onChange,
  note,
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>Select payment method</Text>
      <View style={styles.row}>
        {methods.map(method => {
          const selected = value === method.id;
          const Icon = ICONS[method.icon] || CardPaymentIcon;
          return (
            <TouchableOpacity
              key={method.id}
              style={styles.item}
              onPress={() => onChange(method.id)}
              activeOpacity={0.82}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={method.label}>
              <View style={styles.slot}>
                <View
                  style={[
                    styles.outerRing,
                    selected ? styles.outerRingSelected : styles.outerRingIdle,
                  ]}>
                  <View style={styles.innerDisc}>
                    <Icon selected={selected} />
                  </View>
                </View>
                {selected ? (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[styles.label, selected && styles.labelSelected]}
                numberOfLines={2}>
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 110,
  },
  slot: {
    width: OUTER,
    height: OUTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  outerRing: {
    width: OUTER,
    height: OUTER,
    borderRadius: OUTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SDK_COLORS.cardCream,
  },
  outerRingIdle: {
    borderWidth: 1,
    borderColor: '#E0D8CC',
  },
  outerRingSelected: {
    borderWidth: 3,
    borderColor: SDK_COLORS.primary,
    shadowColor: SDK_COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  innerDisc: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    color: SDK_COLORS.textMutedDark,
    lineHeight: 13,
    paddingHorizontal: 2,
    minHeight: 26,
  },
  labelSelected: {
    color: SDK_COLORS.textDark,
    fontWeight: '700',
  },
  note: {
    marginTop: 10,
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    lineHeight: 16,
  },
});
