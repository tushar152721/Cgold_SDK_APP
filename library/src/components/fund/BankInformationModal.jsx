import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { FUND_DEPOSIT_BANK_INFO } from '../../constants/fundDeposit';
import { SDK_COLORS } from '../../constants';

function BankFieldRow({ label, value, onCopy }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue} selectable>
          {value}
        </Text>
      </View>
      {onCopy ? (
        <TouchableOpacity
          style={styles.copyBtn}
          onPress={() => onCopy(value, label)}
          accessibilityLabel={`Copy ${label}`}>
          <View style={styles.copyIcon}>
            <View style={styles.copySquare} />
            <View style={[styles.copySquare, styles.copySquareOffset]} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function BankInformationModal({ visible, onClose, currency }) {
  const info = {
    ...FUND_DEPOSIT_BANK_INFO,
    currency: currency || FUND_DEPOSIT_BANK_INFO.currency,
  };

  const handleCopy = async (text, label) => {
    try {
      await Share.share({ message: text, title: label });
    } catch {
      Alert.alert(label, text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Bank Information</Text>

          <BankFieldRow
            label="Account Name"
            value={info.accountName}
            onCopy={handleCopy}
          />
          <BankFieldRow label="Swift/BIC" value={info.swiftBic} onCopy={handleCopy} />
          <BankFieldRow label="IBAN" value={info.iban} onCopy={handleCopy} />
          <BankFieldRow
            label="Account Number"
            value={info.accountNumber}
            onCopy={handleCopy}
          />
          <BankFieldRow label="Bank" value={info.bank} />
          <BankFieldRow label="Currency" value={info.currency} />

          <Text style={styles.note}>
            * Please transfer funds to the above account from your banking terminal
            and then enter the details below.
          </Text>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    maxHeight: '85%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SDK_COLORS.borderCream,
  },
  fieldText: {
    flex: 1,
    paddingRight: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    lineHeight: 20,
  },
  copyBtn: {
    padding: 4,
    marginTop: 2,
  },
  copyIcon: {
    width: 18,
    height: 18,
  },
  copySquare: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: SDK_COLORS.textMutedDark,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  copySquareOffset: {
    top: 4,
    left: 4,
    backgroundColor: SDK_COLORS.cardCream,
  },
  note: {
    fontSize: 12,
    color: SDK_COLORS.textDark,
    lineHeight: 18,
    marginTop: 14,
    marginBottom: 16,
  },
  closeBtn: {
    backgroundColor: '#E8E4DC',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
});
