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

function formatParts(num) {
  const amount = Number(num || 0).toFixed(2);
  const [intPart, decimalPart] = amount.split('.');
  return { intPart, decimalPart };
}

function AmountRow({ value, symbol, golden }) {
  const { intPart, decimalPart } = formatParts(value);
  return (
    <View style={styles.amountRow}>
      <Text style={[styles.currencySym, golden && styles.currencySymGold]}>
        {symbol}
      </Text>
      <Text style={[styles.amountInt, golden && styles.amountIntGold]}>
        {intPart}
      </Text>
      <Text style={[styles.amountDec, golden && styles.amountDecGold]}>
        .{decimalPart}
      </Text>
    </View>
  );
}

export default function FundChargesModal({
  visible,
  onClose,
  onConfirm,
  calculatedCharges,
  currency = 'AED',
  paymentMethod = 'Credit/Debit',
  confirming = false,
  formatAmount,
}) {
  if (!calculatedCharges) {
    return null;
  }

  const symbol =
    typeof formatAmount === 'function'
      ? formatAmount(0, 0).replace(/[\d.,\s]/g, '').trim() || (currency === 'USD' ? '$' : 'Đ')
      : currency === 'USD'
        ? '$'
        : 'Đ';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.titleGold}>
              Charges
              <Text style={styles.titleDark}> & Tax Information</Text>
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <ChargeLine
              title="Entered Fund"
              subtitle="Post-purchase balance overview."
              value={calculatedCharges.enteredFund}
              symbol={symbol}
            />
            <ChargeLine
              title={`Service Charge (${paymentMethod})`}
              subtitle="Service charges post-purchase."
              value={calculatedCharges.processingFee}
              symbol={symbol}
            />
            <ChargeLine
              title="VAT Fee (5% on Fee)"
              subtitle="Marketing resource budget."
              value={calculatedCharges.gstFee}
              symbol={symbol}
            />

            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalTitle}>Total Payable Fund</Text>
                <AmountRow
                  value={calculatedCharges.totalPayable}
                  symbol={symbol}
                  golden
                />
              </View>
              <Text style={styles.totalSub}>
                Digital Gold calculated price
              </Text>
            </View>

            <Text style={styles.note}>
              {paymentMethod} payments may include additional charges.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, confirming && styles.confirmBtnDisabled]}
            onPress={onConfirm}
            disabled={confirming}
            activeOpacity={0.9}>
            {confirming ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={styles.confirmText}>Confirm & Pay Now ✓</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ChargeLine({ title, subtitle, value, symbol }) {
  return (
    <View style={styles.line}>
      <View style={styles.lineText}>
        <Text style={styles.lineTitle}>{title}</Text>
        <Text style={styles.lineSub}>{subtitle}</Text>
      </View>
      <AmountRow value={value} symbol={symbol} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 28,
  },
  titleGold: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.primary,
    textAlign: 'center',
  },
  titleDark: {
    color: SDK_COLORS.textDark,
  },
  close: {
    position: 'absolute',
    right: 0,
    fontSize: 20,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  body: {
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  lineText: {
    flex: 1,
    minWidth: 0,
  },
  lineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  lineSub: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currencySym: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 2,
    color: SDK_COLORS.textDark,
  },
  currencySymGold: {
    color: SDK_COLORS.primary,
  },
  amountInt: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  amountIntGold: {
    color: SDK_COLORS.primary,
  },
  amountDec: {
    fontSize: 16,
    fontWeight: '700',
    color: '#848484',
  },
  amountDecGold: {
    color: '#A8A8A8',
  },
  totalBox: {
    borderWidth: 1,
    borderColor: '#F4D287',
    backgroundColor: '#FFFCF5',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SDK_COLORS.primary,
    flex: 1,
  },
  totalSub: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginTop: 4,
  },
  note: {
    textAlign: 'center',
    fontSize: 11,
    color: '#737373',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 8,
  },
  confirmBtn: {
    marginTop: 14,
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
