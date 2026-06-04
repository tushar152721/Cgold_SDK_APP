import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import InfoRow from './InfoRow';
import {
  normalizeKycStatus,
  formatKycDisplayStatus,
} from '../utils/kycFlow';

function statusBadgeStyle(status) {
  const norm = normalizeKycStatus(status);
  if (norm === 'approved') {
    return { bg: '#DCFCE7', color: '#15803D', label: 'Approved' };
  }
  if (norm === 'rejected') {
    return { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' };
  }
  if (norm === 'pending') {
    return { bg: '#FEF3C7', color: '#92400E', label: 'Under review' };
  }
  if (norm === 'not_started') {
    return { bg: '#F3F4F6', color: SDK_COLORS.textMutedDark, label: 'Not started' };
  }
  return { bg: '#F3F4F6', color: SDK_COLORS.textMutedDark, label: formatKycDisplayStatus(status) };
}

function formatDate(value) {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

export default function KycDetailsCard({ status, comments, reference, details }) {
  const badge = statusBadgeStyle(status);
  const hasProfile = Boolean(
    details &&
      (details.fullName ||
        details.IDno ||
        details.dob ||
        details.nationality ||
        details.gender ||
        details.expiryDate),
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>KYC details</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <Text style={styles.statusLine}>
        Status: {formatKycDisplayStatus(status)}
      </Text>

      {hasProfile ? (
        <View style={styles.block}>
          {details.fullName ? (
            <InfoRow label="Full name" value={details.fullName} variant="cream" />
          ) : null}
          {details.IDno ? (
            <InfoRow label="ID number" value={details.IDno} variant="cream" />
          ) : null}
          {details.dob ? (
            <InfoRow label="Date of birth" value={details.dob} variant="cream" />
          ) : null}
          {details.nationality ? (
            <InfoRow label="Nationality" value={details.nationality} variant="cream" />
          ) : null}
          {details.gender ? (
            <InfoRow label="Gender" value={details.gender} variant="cream" />
          ) : null}
          {details.expiryDate ? (
            <InfoRow label="ID expiry" value={details.expiryDate} variant="cream" />
          ) : null}
          {details.updatedAt ? (
            <InfoRow
              label="Last updated"
              value={formatDate(details.updatedAt)}
              variant="cream"
            />
          ) : null}
        </View>
      ) : (
        <Text style={styles.empty}>
          No identity document on file yet. Start verification below to submit
          your details.
        </Text>
      )}

      {comments ? (
        <InfoRow label="Notes" value={comments} variant="cream" multiline />
      ) : null}
      {reference ? (
        <InfoRow label="Reference" value={reference} variant="cream" multiline />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusLine: {
    fontSize: 14,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 12,
  },
  block: {
    marginBottom: 4,
  },
  empty: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    lineHeight: 20,
    marginBottom: 12,
  },
});
