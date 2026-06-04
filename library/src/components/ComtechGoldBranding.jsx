import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';
import ComtechGoldLogo from './ComtechGoldLogo';

export default function ComtechGoldBranding({ compact = false }) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.logoBand}>
        <ComtechGoldLogo width={260} />
      </View>
      <Text style={styles.tagline}>Digital gold · Secure partner access</Text>
      <View style={styles.goldBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  wrapCompact: {
    marginBottom: 16,
    marginTop: 8,
  },
  logoBand: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  tagline: {
    fontSize: 14,
    color: SDK_COLORS.textMutedDark,
    marginTop: 12,
    textAlign: 'center',
  },
  goldBar: {
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: SDK_COLORS.primary,
    marginTop: 16,
  },
});
