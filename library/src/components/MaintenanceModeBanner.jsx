import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

/**
 * @param {{ message?: string, compact?: boolean }} props
 */
export default function MaintenanceModeBanner({ message, compact = false }) {
  const text =
    message ||
    'ComTech Gold is temporarily unavailable for maintenance. Buying gold is disabled until service resumes.';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.title}>Under maintenance</Text>
      <Text style={styles.message}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  cardCompact: {
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: '#78350F',
  },
});
