import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

export default function SdkNote({ children, variant = 'info' }) {
  return (
    <View
      style={[
        styles.box,
        variant === 'warn' && styles.boxWarn,
        variant === 'muted' && styles.boxMuted,
      ]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.25)',
  },
  boxWarn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  boxMuted: {
    backgroundColor: 'rgba(107, 114, 128, 0.08)',
    borderColor: SDK_COLORS.borderCream,
  },
  text: {
    fontSize: 12,
    lineHeight: 17,
    color: SDK_COLORS.textMutedDark,
    textAlign: 'center',
  },
});
