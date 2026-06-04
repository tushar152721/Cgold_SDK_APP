import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requireConfig, emitEvent } from '../configStore';
import { sdkApi } from '../api/client';
import { loadSdkProfile, clearProfileCache } from '../utils/profileCache';
import { SDK_COLORS } from '../constants';
import SdkScreenLayout, { layoutCardStyles as ls } from '../components/SdkScreenLayout';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import MemberProfileCard from '../components/MemberProfileCard';
import SdkNote from '../components/SdkNote';

function memberProfileFromConnectResponse(data) {
  if (!data) {
    return null;
  }
  return data.memberProfile || null;
}

export default function ConnectComtechScreen() {
  const navigation = useNavigation();
  const config = requireConfig();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [memberProfile, setMemberProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [error, setError] = useState(null);
  const autoTried = useRef(false);
  const connectInFlight = useRef(false);

  const goHome = () => navigation.replace('SdkHome');

  const loadBounzMemberProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await sdkApi.previewMemberProfile({
        mobile: config.mobile,
        countryCode: config.countryCode,
        loyaltyId: config.loyaltyId,
      });
      const body = res?.data ?? {};
      setMemberProfile(body.memberProfile ?? null);
      if (!body.memberProfile) {
        setProfileError('Member profile not found for this mobile number.');
      }
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not load Bounz member profile';
      setProfileError(String(message));
      setMemberProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const tryExistingSession = async () => {
    if (config.userToken) {
      try {
        const data = await loadSdkProfile({ force: true });
        if (data) {
          goHome();
          return true;
        }
      } catch {
        /* no session */
      }
    }
    return false;
  };

  const handleConnect = async (silent = false) => {
    if (connectInFlight.current) {
      return false;
    }
    connectInFlight.current = true;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const details = config.userDetails || {};
      const res = await sdkApi.connect({
        mobile: config.mobile,
        countryCode: config.countryCode,
        loyaltyId: config.loyaltyId,
        firstName: details.firstName || memberProfile?.firstName,
        lastName: details.lastName || memberProfile?.lastName,
        email: details.email || memberProfile?.email || `sdk_${config.mobile}@bounz.local`,
        password: details.password,
        userDetails: details,
      });
      const body = res?.data ?? {};
      const linkedProfile = memberProfileFromConnectResponse(body);
      if (linkedProfile) {
        setMemberProfile(linkedProfile);
      }
      clearProfileCache();
      await loadSdkProfile({ force: true });
      emitEvent('register', { action: 'connect', success: true });
      goHome();
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not connect to ComTech Gold';
      if (!silent) {
        emitEvent('error', { source: 'connect', message });
        setError(String(message));
      }
      return false;
    } finally {
      connectInFlight.current = false;
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChecking(true);
      if (await tryExistingSession()) {
        if (!cancelled) {
          setChecking(false);
        }
        return;
      }
      await loadBounzMemberProfile();
      if (!cancelled && !autoTried.current) {
        autoTried.current = true;
        await handleConnect(true);
      }
      if (!cancelled) {
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  if (checking) {
    return (
      <View style={styles.root}>
        <ComtechGoldHeader compact={false} showMenu={false} showBack={false} />
        <View style={styles.checking}>
          <ActivityIndicator size="large" color={SDK_COLORS.primary} />
          <Text style={styles.checkingText}>Linking your Bounz account…</Text>
        </View>
      </View>
    );
  }

  const canLink = Boolean(memberProfile) && !profileLoading;

  const footer = (
    <>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {profileError ? (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>{profileError}</Text>
          <TouchableOpacity style={ls.linkButton} onPress={loadBounzMemberProfile}>
            <Text style={ls.linkText}>Retry profile lookup</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <TouchableOpacity
        style={[ls.button, (loading || !canLink) && ls.buttonDisabled]}
        onPress={() => handleConnect(false)}
        disabled={loading || !canLink}>
        {loading ? (
          <ActivityIndicator color="#1A1A1A" />
        ) : (
          <Text style={ls.buttonText}>Link Bounz & ComTech Gold</Text>
        )}
      </TouchableOpacity>
      <SdkNote>
        We load your Bounz member profile (name, email, points) from ClubClass,
        then create or link your ComTech Gold account.
      </SdkNote>
    </>
  );

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact={false} showMenu={false} showBack={false} />
      <SdkScreenLayout variant="cream" footer={footer}>
        <Text style={styles.headline}>
          Convert your Bounz points to digital gold
        </Text>
        <Text style={styles.sub}>
          Confirm your Bounz membership below, then link to ComTech Gold.
        </Text>

        <MemberProfileCard
          memberProfile={memberProfile}
          loading={profileLoading}
          title="Your Bounz profile"
        />
      </SdkScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SDK_COLORS.backgroundCream,
  },
  checking: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  checkingText: {
    marginTop: 16,
    fontSize: 15,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  sub: {
    fontSize: 15,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 12,
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
  warnBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warnText: {
    color: '#92400E',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
});
