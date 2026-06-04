import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { SDK_COLORS } from '../constants';

export default function DashboardActionTile({
  title,
  subtitle,
  onPress,
  disabled = false,
  variant = 'primary',
}) {
  return (
    <TouchableOpacity
      style={[
        styles.tile,
        variant === 'outline' && styles.tileOutline,
        disabled && styles.tileDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}>
      <Text style={[styles.title, disabled && styles.titleDisabled]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, disabled && styles.subtitleDisabled]}>
          {subtitle}
        </Text>
      ) : null}
      {disabled ? <View style={styles.badge}><Text style={styles.badgeText}>Soon</Text></View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    width: '100%',
    backgroundColor: SDK_COLORS.primary,
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SDK_COLORS.primaryDark,
  },
  tileOutline: {
    backgroundColor: SDK_COLORS.cardCream,
    borderColor: SDK_COLORS.primary,
  },
  tileDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
    opacity: 0.95,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  titleDisabled: {
    color: '#6B7280',
  },
  subtitle: {
    fontSize: 11,
    color: '#374151',
    marginTop: 4,
    lineHeight: 15,
  },
  subtitleDisabled: {
    color: '#9CA3AF',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
