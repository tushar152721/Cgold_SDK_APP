import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

/**
 * @param {{ banner: { kind: string, message: string } | null, onDismiss?: () => void }} props
 */
export default function OrderStatusBanner({ banner, onDismiss }) {
  if (!banner?.message) {
    return null;
  }

  const isSuccess = banner.kind === 'executed';
  const isError = banner.kind === 'rejected';
  const isProcessing = banner.kind === 'processing';

  return (
    <View
      style={[
        styles.card,
        isSuccess && styles.cardSuccess,
        isError && styles.cardError,
        isProcessing && styles.cardProcessing,
      ]}>
      <Text style={styles.title}>
        {isSuccess
          ? 'Purchase complete'
          : isError
            ? 'Order not completed'
            : 'Order processing'}
      </Text>
      <Text style={styles.message}>{banner.message}</Text>
      {onDismiss && !isProcessing ? (
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.45)',
  },
  cardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cardProcessing: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: 'rgba(201, 162, 39, 0.4)',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: SDK_COLORS.textMutedDark,
  },
  dismissBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: SDK_COLORS.primaryDark,
  },
});
