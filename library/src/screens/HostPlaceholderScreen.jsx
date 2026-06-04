import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

/**
 * Shown inside SDK navigator when host has not pushed a custom host screen.
 * The example app replaces this with its own Host screen.
 */
export default function HostPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Host app screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SDK_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: SDK_COLORS.textMuted,
  },
});
