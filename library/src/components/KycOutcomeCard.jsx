import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import { normalizeKycStatus } from '../utils/kycFlow';

const OUTCOME_CONFIG = {
  approved: {
    title: 'KYC is done',
    message: 'Your identity is verified. You can buy gold with Bounz points.',
    tone: 'success',
  },
  rejected: {
    title: 'KYC not approved',
    message:
      'Verification was declined or could not be completed. You can try again from KYC.',
    tone: 'failed',
  },
  pending: {
    title: 'KYC submitted',
    message:
      'Your verification was submitted. ComTech Gold is reviewing it — open the KYC screen to see status and your submitted details.',
    tone: 'pending',
  },
  failed: {
    title: 'Verification incomplete',
    message: 'The verification session ended without approval. Please try again.',
    tone: 'failed',
  },
  unknown: {
    title: 'KYC status updated',
    message: 'Check your status below. Refresh if it still looks wrong.',
    tone: 'pending',
  },
};

/**
 * @param {{ outcome?: string, status?: string, comments?: string }} props
 */
export default function KycOutcomeCard({ outcome, status, comments }) {
  const norm =
    outcome || normalizeKycStatus(status) || 'unknown';
  const key =
    norm === 'complete' ? 'pending' : norm in OUTCOME_CONFIG ? norm : 'unknown';
  const cfg = OUTCOME_CONFIG[key] || OUTCOME_CONFIG.unknown;

  return (
    <View
      style={[
        styles.card,
        cfg.tone === 'success' && styles.cardSuccess,
        cfg.tone === 'failed' && styles.cardFailed,
        cfg.tone === 'pending' && styles.cardPending,
      ]}>
      <Text style={styles.title}>{cfg.title}</Text>
      <Text style={styles.message}>{cfg.message}</Text>
      {status ? (
        <Text style={styles.statusLine}>
          Current status: <Text style={styles.statusValue}>{status}</Text>
        </Text>
      ) : null}
      {comments ? (
        <Text style={styles.comments}>{comments}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  cardFailed: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    borderColor: '#FECACA',
  },
  cardPending: {
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
    borderColor: 'rgba(201, 162, 39, 0.35)',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
  },
  statusLine: {
    marginTop: 12,
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
  },
  statusValue: {
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  comments: {
    marginTop: 8,
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
