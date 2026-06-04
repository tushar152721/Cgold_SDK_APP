import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { requireConfig, emitEvent } from '../configStore';
import { sdkApi } from '../api/client';
import { SDK_COLORS } from '../constants';
import SdkScreenLayout, { layoutCardStyles as ls } from '../components/SdkScreenLayout';
import ComtechGoldHeader from '../components/ComtechGoldHeader';
import KycDetailsCard from '../components/KycDetailsCard';
import KycOutcomeCard from '../components/KycOutcomeCard';
import {
  openKycVerification,
  parseKycStartResponse,
  parseKycStatusDetail,
  normalizeKycStatus,
  fetchKycMeta,
} from '../utils/kycFlow';

export default function KycScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const config = requireConfig();
  const [status, setStatus] = useState('—');
  const [comments, setComments] = useState('');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [lastReference, setLastReference] = useState(null);
  const [error, setError] = useState(null);

  const refreshStatus = useCallback(async () => {
    if (!config.userToken) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await sdkApi.getKycStatus();
      const parsed = parseKycStatusDetail(res);
      setStatus(parsed.status);
      setComments(parsed.comments);
      setDetails(parsed.details);
      if (parsed.reference) {
        setLastReference(parsed.reference);
      }
      emitEvent('kyc', {
        action: 'status',
        status: parsed.status,
        comments: parsed.comments,
      });
      if (normalizeKycStatus(parsed.status) === 'approved') {
        emitEvent('kyc', { action: 'approved' });
      }
      return parsed;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not load KYC details';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [config.userToken]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus, route.params?.refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshStatus();
      }
    });
    return () => sub.remove();
  }, [refreshStatus]);

  const onStartVerification = async () => {
    setStarting(true);
    setError(null);
    try {
      const kycMeta = await fetchKycMeta(sdkApi);
      const res = await sdkApi.startKyc({});
      const { reference, verificationUrl } = parseKycStartResponse(res);
      setLastReference(reference);

      if (res?.data?.error) {
        throw new Error(res.data.error);
      }

      const opened = await openKycVerification({
        verificationUrl,
        reference,
        navigation,
        kycMeta,
      });
      if (!opened.ok) {
        setError(opened.error || 'Could not open verification');
      }
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start KYC';
      emitEvent('error', { source: 'kyc', message });
      setError(String(message));
    } finally {
      setStarting(false);
    }
  };

  const isApproved =
    status === 'Approved' || normalizeKycStatus(status) === 'approved';
  const isRejected = normalizeKycStatus(status) === 'rejected';
  const canStart = !isApproved && config.userToken;

  const footer = (
    <>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isApproved ? (
        <>
          <KycOutcomeCard outcome="approved" status={status} comments={comments} />
          <TouchableOpacity
            style={ls.button}
            onPress={() => navigation.navigate('Trade', { mode: 'buy' })}>
            <Text style={ls.buttonText}>Buy gold</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {isRejected ? (
        <KycOutcomeCard outcome="rejected" status={status} comments={comments} />
      ) : null}

      {canStart ? (
        <TouchableOpacity
          style={[ls.button, starting && ls.buttonDisabled]}
          onPress={onStartVerification}
          disabled={starting}>
          {starting ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={ls.buttonText}>Start identity verification</Text>
          )}
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={ls.linkButton} onPress={refreshStatus}>
        <Text style={ls.linkText}>Refresh KYC details</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.root}>
      <ComtechGoldHeader compact />
      <SdkScreenLayout
        variant="cream"
        fill
        subtitle={
          isApproved
            ? 'Your verified identity details (read-only)'
            : 'Complete KYC here, then view status and submitted details'
        }
        loading={loading}
        footer={footer}>
        <KycDetailsCard
          status={status}
          comments={comments}
          reference={lastReference}
          details={details}
        />

        {!isApproved ? (
          <Text style={styles.hint}>
            Tap Start identity verification below to submit your ID. After you
            finish, ComTech Gold reviews your KYC — use Refresh to update status
            and see submitted details on this screen. You cannot edit documents
            after submission.
          </Text>
        ) : null}
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
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  hint: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
