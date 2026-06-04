import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet, Alert } from 'react-native';
import { SDK_COLORS, TERMS_AND_CONDITIONS_URL } from '../constants';

export default function ComtechGoldCopyrightFooter({ variant = 'cream' }) {
  const year = new Date().getFullYear();
  const cream = variant === 'cream';

  const openTerms = async () => {
    try {
      const can = await Linking.canOpenURL(TERMS_AND_CONDITIONS_URL);
      if (can) {
        await Linking.openURL(TERMS_AND_CONDITIONS_URL);
      } else {
        Alert.alert('Terms & Conditions', TERMS_AND_CONDITIONS_URL);
      }
    } catch {
      Alert.alert('Terms & Conditions', TERMS_AND_CONDITIONS_URL);
    }
  };

  return (
    <View style={[styles.wrap, cream ? styles.wrapCream : styles.wrapDark]}>
      <Text style={[styles.copy, cream && styles.copyCream]}>
        © {year} ComTech Gold LLC. All rights reserved.
      </Text>
      <Pressable onPress={openTerms} accessibilityRole="link">
        <Text style={styles.link}>Terms & Conditions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  wrapCream: {
    borderTopColor: SDK_COLORS.borderCream,
  },
  wrapDark: {
    borderTopColor: SDK_COLORS.border,
  },
  copy: {
    fontSize: 11,
    color: SDK_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 6,
  },
  copyCream: {
    color: SDK_COLORS.textMutedDark,
  },
  link: {
    fontSize: 12,
    color: SDK_COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
