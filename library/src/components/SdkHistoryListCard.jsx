import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../constants';

function formatHistoryDate(value) {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

function statusPresentation(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'redeemed') {
    return { label: 'Approved', color: '#15803D', bg: '#DCFCE7' };
  }
  if (s === 'failed') {
    return { label: 'Failed', color: '#991B1B', bg: '#FEE2E2' };
  }
  if (s === 'released') {
    return { label: 'Released', color: '#92400E', bg: '#FEF3C7' };
  }
  if (s === 'locked') {
    return { label: 'Processing', color: '#92400E', bg: '#FEF3C7' };
  }
  if (s) {
    return {
      label: s.charAt(0).toUpperCase() + s.slice(1),
      color: SDK_COLORS.textMutedDark,
      bg: '#F3F4F6',
    };
  }
  return { label: '—', color: SDK_COLORS.textMutedDark, bg: '#F3F4F6' };
}

/**
 * Gold History–style row: icon, title, date, amount, status badge.
 */
export default function SdkHistoryListCard({
  title = 'Gold purchased',
  date,
  amountGm,
  status,
  meta,
}) {
  const badge = statusPresentation(status);
  const amount =
    amountGm != null && amountGm !== ''
      ? `${Number(amountGm).toFixed(2)} gms`
      : '—';

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconGlyph}>TX</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{formatHistoryDate(date)}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>
        <View style={[styles.statusRow, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.color }]}>
            {badge.label}
          </Text>
          <Text style={[styles.check, { color: badge.color }]}>✓</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SDK_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconGlyph: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  body: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
  },
  meta: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 88,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  check: {
    fontSize: 11,
    fontWeight: '700',
  },
});
