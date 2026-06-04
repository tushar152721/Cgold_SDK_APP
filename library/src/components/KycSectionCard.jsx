import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import { normalizeKycStatus } from '../utils/kycFlow';

export default function KycSectionCard({ status, onPress, onRefresh, loading }) {
  const norm = normalizeKycStatus(status);
  const isOk = norm === 'approved' || status === 'Approved';

  let title = 'KYC required';
  let message =
    'Complete identity verification (KYC) before buying gold. Tap to start and submit your ID.';
  if (isOk) {
    title = 'KYC is done';
    message = 'Verification complete. Tap to view your submitted details.';
  } else if (norm === 'rejected') {
    title = 'KYC not approved';
    message = 'Verification was declined. Tap to see comments and try again.';
  } else if (norm === 'pending') {
    title = 'KYC submitted';
    message =
      'Under review by ComTech Gold. Tap to view status and submitted details.';
  } else if (norm === 'not_started') {
    title = 'KYC required';
    message = 'You have not completed KYC yet. Tap to start verification.';
  }

  return (
    <View style={[styles.card, isOk && styles.cardOk, norm === 'rejected' && styles.cardFail]}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.status}>
            Status: <Text style={styles.statusValue}>{status || '—'}</Text>
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={onPress}>
          <Text style={styles.btnText}>
            {isOk ? 'View details' : norm === 'pending' ? 'View status' : 'Do KYC'}
          </Text>
        </TouchableOpacity>
        {onRefresh ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={onRefresh}
            disabled={loading}>
            <Text style={[styles.btnText, styles.btnTextOutline]}>
              {loading ? '…' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
  },
  cardOk: {
    borderColor: 'rgba(34, 197, 94, 0.4)',
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },
  cardFail: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  status: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    marginTop: 6,
  },
  statusValue: {
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  message: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    marginTop: 6,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    backgroundColor: SDK_COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SDK_COLORS.primary,
  },
  btnText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#1A1A1A',
  },
  btnTextOutline: {
    color: SDK_COLORS.primaryDark,
  },
});
