import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';

export default function DashboardGridTile({
  title,
  subtitle,
  onPress,
  disabled = false,
  fullWidth = false,
}) {
  const isDisabled = disabled || !onPress;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        fullWidth && styles.tileFull,
        isDisabled && styles.tileDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.arrowBtn, isDisabled && styles.arrowBtnDisabled]}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {disabled && title == "Sell gold" ? (
        <View style={styles.soon}>
          <Text style={styles.soonText}>Soon</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    padding: 14,
    minHeight: 88,
    overflow: 'hidden',
    shadowColor: SDK_COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tileFull: {
    flex: 0,
    width: '100%',
    marginBottom: 12,
  },
  tileDisabled: {
    opacity: 0.85,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    paddingRight: 8,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -1,
  },
  subtitle: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginTop: 4,
    lineHeight: 15,
  },
  soon: {
    position: 'absolute',
    top: 10,
    right: 48,
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
