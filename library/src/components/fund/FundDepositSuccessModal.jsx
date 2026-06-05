import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SDK_COLORS } from '../../constants';

/**
 * Success overlay after online (Geidea) or direct-transfer fund deposit.
 */
export default function FundDepositSuccessModal({
  visible,
  onClose,
  variant = 'online',
  amount,
  formatAmount,
  alreadyProcessed = false,
}) {
  const isDirect = variant === 'direct';

  const title = isDirect
    ? 'Funds request submitted'
    : alreadyProcessed
      ? 'Funds already credited'
      : 'Funds added successfully';

  const headline = isDirect
    ? 'Funds Added Request Successfully!'
    : 'Funds Added Successfully!';

  const description = isDirect
    ? 'Thank you for the deposit request. Your fund will reflect in your account after confirmation from admin, latest within 24 hours.'
    : alreadyProcessed
      ? 'Your fund deposit was already credited to your balance.'
      : 'Payment successful. Funds have been added to your available balance.';

  const amountLabel =
    amount != null && Number.isFinite(Number(amount)) && typeof formatAmount === 'function'
      ? formatAmount(Number(amount), 2)
      : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.iconRing}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          {amountLabel ? (
            <View style={styles.amountBlock}>
              <Text style={styles.amountValue}>{amountLabel}</Text>
              <Text style={styles.headline}>{headline}</Text>
            </View>
          ) : (
            <Text style={styles.headlineStandalone}>{headline}</Text>
          )}

          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onClose}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard">
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
    color: SDK_COLORS.textMutedDark,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 2,
    borderColor: SDK_COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: {
    fontSize: 36,
    fontWeight: '800',
    color: SDK_COLORS.success,
    marginTop: -2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  amountBlock: {
    alignItems: 'center',
    marginBottom: 12,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: SDK_COLORS.primary,
    marginBottom: 6,
  },
  headline: {
    fontSize: 15,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
  },
  headlineStandalone: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
