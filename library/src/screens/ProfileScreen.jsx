import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { requireConfig } from '../configStore';
import { loadSdkProfile } from '../utils/profileCache';
import { SDK_COLORS } from '../constants';
import SdkScreenLayout, { layoutCardStyles as ls } from '../components/SdkScreenLayout';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import InfoRow from '../components/InfoRow';
import MemberProfileCard from '../components/MemberProfileCard';
import SdkNote from '../components/SdkNote';
import { useSdkCurrency } from '../context/SdkCurrencyContext';

export default function ProfileScreen() {
  const config = requireConfig();
  const { formatAed } = useSdkCurrency();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (force = false) => {
    if (!config.userToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await loadSdkProfile({ force });
      setProfile(data);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Could not load profile',
      );
    } finally {
      setLoading(false);
    }
  }, [config.userToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const user = profile?.user || {};
  const link = user.sdkMemberProfileLinkedId || {};
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />
      <SdkScreenLayout
        variant="cream"
        fill
        subtitle="Your ComTech Gold & Bounz account"
        loading={loading && !profile}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <SdkNote variant="muted">
          Bounz data is loaded from ClubClass member_profile when you link.
        </SdkNote>

        {profile?.memberProfile ? (
          <MemberProfileCard
            memberProfile={profile.memberProfile}
            title="Bounz member profile"
          />
        ) : null}

        <View style={[ls.card, ls.cardCream]}>
          <InfoRow label="Name" value={name} variant="cream" />
          <InfoRow label="Email" value={user.email || '—'} variant="cream" />
          <InfoRow
            label="Mobile"
            value={`${config.countryCode} ${config.mobile}`}
            variant="cream"
          />
          <InfoRow
            label="Loyalty ID"
            value={config.loyaltyId || link.loyaltyId || '—'}
            variant="cream"
          />
          <InfoRow label="KYC status" value={profile?.kycStatus ?? '—'} variant="cream" />
          <InfoRow
            label="Bounz points"
            value={
              profile?.pointBalance != null
                ? Number(profile.pointBalance).toLocaleString()
                : '—'
            }
            variant="cream"
          />
          <InfoRow
            label="Points trading"
            value={profile?.canUseBounzPoints ? 'Enabled' : 'Disabled'}
            variant="cream"
          />
          <InfoRow
            label="AED balance"
            value={
              user.fundTotal != null ? formatAed(user.fundTotal, 2) : '—'
            }
            variant="cream"
          />
          <InfoRow
            label="Gold balance"
            value={user.goldTotal != null ? `${user.goldTotal} g` : '—'}
            variant="cream"
          />
          {user.platformID ? (
            <InfoRow label="Platform ID" value={user.platformID} variant="cream" multiline />
          ) : null}
        </View>

        <TouchableOpacity style={ls.button} onPress={refresh} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={ls.buttonText}>Refresh profile</Text>
          )}
        </TouchableOpacity>
      </SdkScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    textAlign: 'center',
  },
});
