import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SDK_COLORS } from '../constants';
import { useSdkPrice } from '../context/SdkPriceContext';
import { useSdkCurrency } from '../context/SdkCurrencyContext';

export default function MarketPriceCard({ compact = false }) {
  const { price } = useSdkPrice();
  const { formatMarketGoldRate, getMarketGoldRate } = useSdkCurrency();
  const pulse = useRef(new Animated.Value(1)).current;
  const isOpen = Boolean(price?.isMarket);
  const buyGm = price?.buyGm;
  const aedPerGram = buyGm != null ? getMarketGoldRate(buyGm) : null;

  useEffect(() => {
    if (!isOpen) {
      pulse.setValue(1);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isOpen, pulse]);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.label}>Gold price</Text>
      <Text style={styles.price}>
        {aedPerGram != null ? formatMarketGoldRate(buyGm, 2) : '—'}
      </Text>
      <Text style={styles.perGram}>per gram · AED</Text>

      <View style={styles.statusRow}>
        <Animated.View
          style={[
            styles.dot,
            isOpen ? styles.dotOpen : styles.dotClosed,
            isOpen && { transform: [{ scale: pulse }] },
          ]}
        />
        <Text style={[styles.statusText, isOpen ? styles.statusOpen : styles.statusClosed]}>
          {isOpen ? 'Market open' : 'Market closed'}
        </Text>
      </View>
      {isOpen ? (
        <Text style={styles.live}>Live · updates every few seconds</Text>
      ) : (
        <Text style={styles.live}>Trading resumes when market opens</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E3B155",
    minHeight: 120,
  },
  cardCompact: {
    minHeight: 100,
  },
  label: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: SDK_COLORS.primaryDark,
    marginTop: 6,
  },
  perGram: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotOpen: {
    backgroundColor: SDK_COLORS.success,
  },
  dotClosed: {
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusOpen: {
    color: '#15803D',
  },
  statusClosed: {
    color: SDK_COLORS.textMutedDark,
  },
  live: {
    fontSize: 10,
    color: SDK_COLORS.textMutedDark,
    marginTop: 6,
  },
});
