import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function BuyGoldSummaryModal({
  visible,
  onClose,
  onConfirm,
  grams,
  goldValue,
  fundBalance,
  balanceAfter,
  charges,
  paymentMethodLabel,
  isOnline,
  confirming = false,
  confirmDisabled = false,
  formatAmount,
}) {
  if (!visible) {
    return null;
  }

  const symbol =
    typeof formatAmount === 'function'
      ? formatAmount(0, 0).replace(/[\d.,\s]/g, '').trim() || 'Đ'
      : 'Đ';

  const totalPayable = isOnline
    ? Number(charges?.totalPayable ?? goldValue ?? 0)
    : Number(goldValue ?? 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.titleGold}>
              Gold
              <Text style={styles.titleDark}> Purchase Summary</Text>
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <SummaryRow label="Gold grams" value={`${grams} g`} />
            <SummaryRow
              label="Estimated gold value"
              value={`${symbol} ${Number(goldValue || 0).toFixed(2)}`}
            />
            <SummaryRow label="Payment method" value={paymentMethodLabel} />

            {!isOnline ? (
              <>
                <SummaryRow
                  label="Available balance"
                  value={`${symbol} ${Number(fundBalance || 0).toFixed(2)}`}
                />
                <SummaryRow
                  label="Balance after purchase"
                  value={`${symbol} ${Number(balanceAfter ?? 0).toFixed(2)}`}
                  highlight
                />
              </>
            ) : (
              <>
                <SummaryRow
                  label="Service charge"
                  value={`${symbol} ${Number(charges?.processingFee || 0).toFixed(2)}`}
                />
                <SummaryRow
                  label="VAT"
                  value={`${symbol} ${Number(charges?.gstFee || 0).toFixed(2)}`}
                />
                <SummaryRow
                  label="Total payable"
                  value={`${symbol} ${totalPayable.toFixed(2)}`}
                  highlight
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (confirming || confirmDisabled) && styles.confirmBtnDisabled,
            ]}
            onPress={onConfirm}
            disabled={confirming || confirmDisabled}
            activeOpacity={0.9}>
            {confirming ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={styles.confirmText}>
                {isOnline ? 'Continue to card payment' : 'Confirm purchase'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C9A227',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D4',
  },
  titleGold: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.primary,
  },
  titleDark: {
    color: SDK_COLORS.textDark,
  },
  close: {
    fontSize: 18,
    color: SDK_COLORS.textMutedDark,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE0',
  },
  rowLabel: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    flex: 1,
    paddingRight: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  rowValueHighlight: {
    color: SDK_COLORS.primary,
    fontWeight: '800',
  },
  confirmBtn: {
    margin: 16,
    marginTop: 8,
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
