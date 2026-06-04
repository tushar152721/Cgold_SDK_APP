import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SDK_COLORS } from '../constants';
import InfoRow from './InfoRow';

/**
 * Bounz / ClubClass member_profile (values[0]) summary.
 */
export default function MemberProfileCard({
  memberProfile,
  loading = false,
  title = 'Bounz member profile',
}) {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={SDK_COLORS.primary} />
        <Text style={styles.loadingText}>Loading member profile…</Text>
      </View>
    );
  }

  if (!memberProfile) {
    return null;
  }

  const name =
    memberProfile.fullName ||
    [memberProfile.firstName, memberProfile.lastName].filter(Boolean).join(' ') ||
    '—';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <InfoRow label="Name" value={name} variant="cream" />
      {memberProfile.email ? (
        <InfoRow label="Email" value={memberProfile.email} variant="cream" />
      ) : null}
      {memberProfile.mobile ? (
        <InfoRow
          label="Mobile"
          value={
            memberProfile.countryCode
              ? `+${memberProfile.countryCode} ${memberProfile.mobile}`
              : memberProfile.mobile
          }
          variant="cream"
        />
      ) : null}
      {memberProfile.loyaltyId ? (
        <InfoRow label="Loyalty ID" value={memberProfile.loyaltyId} variant="cream" />
      ) : null}
      {memberProfile.membershipNo ? (
        <InfoRow
          label="Membership no."
          value={memberProfile.membershipNo}
          variant="cream"
        />
      ) : null}
      <InfoRow
        label="Bounz points"
        value={
          memberProfile.pointBalance != null
            ? Number(memberProfile.pointBalance).toLocaleString()
            : '—'
        }
        variant="cream"
      />
      {memberProfile.tentativePoints > 0 ? (
        <InfoRow
          label="Tentative points"
          value={Number(memberProfile.tentativePoints).toLocaleString()}
          variant="cream"
        />
      ) : null}
      {memberProfile.pointsExpiringThisMonth > 0 ? (
        <InfoRow
          label="Expiring this month"
          value={Number(memberProfile.pointsExpiringThisMonth).toLocaleString()}
          variant="cream"
        />
      ) : null}
      {memberProfile.pointsExpiringNextMonth > 0 ? (
        <InfoRow
          label="Expiring next month"
          value={Number(memberProfile.pointsExpiringNextMonth).toLocaleString()}
          variant="cream"
        />
      ) : null}
      {memberProfile.accountStatus ? (
        <InfoRow
          label="Account"
          value={memberProfile.accountStatus}
          variant="cream"
        />
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
  },
});
