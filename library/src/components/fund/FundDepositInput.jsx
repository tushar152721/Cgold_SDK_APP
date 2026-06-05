import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function FundDepositInput({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  hint,
  keyboardType = 'default',
  maxLength,
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.box}>
        <View style={styles.accent} />
        <View style={styles.inner}>
          <View style={styles.inputRow}>
            {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={SDK_COLORS.textMutedDark}
              keyboardType={keyboardType}
              maxLength={maxLength}
            />
          </View>
          {hint ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.hint}>{hint}</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 8,
  },
  box: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9A227',
    // backgroundColor: SDK_COLORS.cardCream,
    overflow: 'hidden',
    minHeight: 56,
  },
  accent: {
    width: 4,
    // backgroundColor: SDK_COLORS.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: SDK_COLORS.borderCream,
    marginTop: 10,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: SDK_COLORS.textDark,
    lineHeight: 17,
  },
});
