import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';
import {
  formatKycDisplayStatus,
  normalizeKycStatus,
} from '../../utils/kycFlow';

/**
 * Dashboard KYC step — complete verification first; show done when approved.
 */
export default function DashboardKycCard({ status, onPress }) {
  const norm = normalizeKycStatus(status);
  const isDone = norm === 'approved' || status === 'Approved';
  const isNotStarted = norm === 'not_started';
  const isAwaitingReview = norm === 'pending';
  const isRejected = norm === 'rejected';
  const displayStatus = formatKycDisplayStatus(status);

  if (isDone) {
    return (
      <View style={[styles.card, styles.cardDone]}>
        <View style={styles.doneRow}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>OK</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.doneTitle}>KYC is done</Text>
            <Text style={styles.doneMessage}>
              Identity verification is complete. You can buy gold with Bounz
              points.
            </Text>
            <Text style={styles.statusLine}>
              Status: <Text style={styles.statusValue}>{displayStatus}</Text>
            </Text>
          </View>
        </View>
        {onPress ? (
          <TouchableOpacity style={styles.linkBtn} onPress={onPress}>
            <Text style={styles.linkBtnText}>View submitted KYC details</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  let title = 'KYC required';
  let message =
    'You must complete identity verification (KYC) before buying gold. Tap below to start — you will submit your ID in the next screen.';
  let ctaLabel = 'Do KYC now';
  let cardStyle = styles.cardAction;

  if (isAwaitingReview) {
    title = 'KYC submitted';
    message =
      'Your documents were sent for verification. ComTech Gold is reviewing them — you cannot change them here. Open KYC to see your status and submitted details.';
    ctaLabel = 'View KYC status';
    cardStyle = styles.cardPending;
  } else if (isRejected) {
    title = 'KYC not approved';
    message =
      'Verification was declined or could not be completed. Open KYC to see comments and try again.';
    ctaLabel = 'Open KYC';
    cardStyle = styles.cardRejected;
  } else if (!isNotStarted) {
    title = 'Complete KYC';
    message =
      'Finish identity verification to buy gold. Open KYC to continue or check your latest status.';
    ctaLabel = 'Open KYC';
  }

  return (
    <View style={[styles.card, cardStyle]}>
      <Text style={styles.stepLabel}>Before you buy</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.statusLine}>
        Status: <Text style={styles.statusValue}>{displayStatus}</Text>
      </Text>
      <Text style={styles.actionMessage}>{message}</Text>
      {onPress ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
          <Text style={styles.primaryBtnText}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.45)',
  },
  cardAction: {
    backgroundColor: SDK_COLORS.cardCream,
    borderColor: SDK_COLORS.primary,
    borderWidth: 1.5,
  },
  cardPending: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: 'rgba(201, 162, 39, 0.45)',
  },
  cardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkMark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginBottom: 4,
  },
  doneMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: SDK_COLORS.textMutedDark,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SDK_COLORS.primaryDark,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: SDK_COLORS.textDark,
    marginBottom: 4,
  },
  actionMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: SDK_COLORS.textMutedDark,
    marginTop: 6,
    marginBottom: 14,
  },
  statusLine: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    marginTop: 4,
  },
  statusValue: {
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  primaryBtn: {
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  linkBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: SDK_COLORS.primaryDark,
  },
});
