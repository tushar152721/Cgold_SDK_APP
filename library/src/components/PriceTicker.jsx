import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import { useSdkPrice } from '../context/SdkPriceContext';
import { useSdkCurrency } from '../context/SdkCurrencyContext';

export default function PriceTicker({ variant = 'dark' }) {
  const { price, connected } = useSdkPrice();
  const { formatMarketGoldRate } = useSdkCurrency();
  const buyGm = price?.buyGm;
  const isMarket = price?.isMarket;
  const cream = variant === 'cream';

  return (
    <View style={[styles.box, cream && styles.boxCream]}>
      <Text style={[styles.label, cream && styles.labelCream]}>
        Market rate (AED/g)
      </Text>
      <Text style={[styles.value, cream && styles.valueCream]}>
        {buyGm != null ? formatMarketGoldRate(buyGm, 2) : '—'}
      </Text>
      <Text style={[styles.meta, cream && styles.metaCream]}>
        {isMarket ? 'Market open' : 'Market closed'}
        {connected ? '' : ' · REST fallback'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: SDK_COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.border,
  },
  label: {
    color: SDK_COLORS.textMuted,
    fontSize: 12,
  },
  value: {
    color: SDK_COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  valueCream: {
    color: SDK_COLORS.primaryDark,
  },
  rate: {
    color: SDK_COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  rateCream: {
    color: SDK_COLORS.textMutedDark,
  },
  meta: {
    color: SDK_COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  metaCream: {
    color: SDK_COLORS.textMutedDark,
  },
  boxCream: {
    backgroundColor: SDK_COLORS.cardCream,
    borderColor: SDK_COLORS.borderCream,
  },
  labelCream: {
    color: SDK_COLORS.textMutedDark,
  },
});
