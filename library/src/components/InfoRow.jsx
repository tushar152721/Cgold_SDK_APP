import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

export default function InfoRow({
  label,
  value,
  variant = 'dark',
  multiline = false,
}) {
  const cream = variant === 'cream';
  return (
    <View
      style={[
        styles.row,
        cream && styles.rowCream,
        multiline && styles.rowMultiline,
      ]}>
      <Text style={[styles.rowLabel, cream && styles.rowLabelCream]}>
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          cream && styles.rowValueCream,
          multiline && styles.rowValueMultiline,
        ]}
        numberOfLines={multiline ? undefined : 3}>
        {value != null ? String(value) : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SDK_COLORS.border,
  },
  rowLabel: {
    color: SDK_COLORS.textMuted,
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    color: SDK_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '58%',
    textAlign: 'right',
  },
  rowCream: {
    borderBottomColor: SDK_COLORS.borderCream,
  },
  rowLabelCream: {
    color: SDK_COLORS.textMutedDark,
  },
  rowValueCream: {
    color: SDK_COLORS.textDark,
  },
  rowMultiline: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rowValueMultiline: {
    maxWidth: '100%',
    textAlign: 'left',
    marginTop: 4,
    lineHeight: 20,
  },
});
