import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import ComtechGold from '@comtechgold/react-native-sdk';

const INIT_PARAMS = {
  mobile: '502753543',
  countryCode: '+971',
  loyaltyId: '',
  partnerCode: 'BOUNZ',
  partnerKey: 'bounz-local-sdk-partner-key',
  environment: 'local' as const,
};

export default function HostScreen() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ComtechGold.init(INIT_PARAMS);
        setReady(true);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Init failed');
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C9A227" />
        <Text style={styles.loading}>Initializing SDK…</Text>
      </View>
    );
  }

  const config = ComtechGold.getConfig();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.brand}>Bounz Host (Demo)</Text>
      <Text style={styles.subtitle}>API: {config?.apiBaseUrl}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Initialized with</Text>
        <Text style={styles.line}>
          {config?.countryCode} {config?.mobile}
        </Text>
        <Text style={styles.line}>Partner: {config?.partnerCode}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => ComtechGold.openLink()}>
        <Text style={styles.buttonText}>Connect to ComTech Gold</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonOutline]}
        onPress={() => ComtechGold.openRegister()}>
        <Text style={[styles.buttonText, styles.buttonTextOutline]}>
          Register
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonOutline]}
        onPress={() => ComtechGold.openSdk()}>
        <Text style={[styles.buttonText, styles.buttonTextOutline]}>
          Open SDK home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    padding: 24,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cardTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 8,
  },
  line: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#C9A227',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C9A227',
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextOutline: {
    color: '#C9A227',
  },
  loading: {
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
});
