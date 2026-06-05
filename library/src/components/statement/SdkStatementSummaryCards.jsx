import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';
import { formatStatementDisplayDate } from '../../utils/statementHistory';

function SummaryCard({ title, date, value, accent }) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.datePill}>
        <Text style={styles.cardDate}>
          {date ? formatStatementDisplayDate(date) : '—'}
        </Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function SdkStatementSummaryCards({
  opening,
  closing,
  formatAed,
}) {
  const openingFund = Number(opening?.fund ?? 0);
  const openingGold = Number(opening?.gold ?? 0);
  const closingFund = Number(closing?.fund ?? 0);
  const closingGold = Number(closing?.gold ?? 0);

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <SummaryCard
          title="Opening funds"
          date={opening?.date}
          value={formatAed(openingFund, 2)}
          accent
        />
        <View style={styles.gap} />
        <SummaryCard
          title="Opening gold"
          date={opening?.date}
          value={`${openingGold.toFixed(2)} g`}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          title="Total funds"
          date={closing?.date}
          value={formatAed(closingFund, 2)}
          accent
        />
        <View style={styles.gap} />
        <SummaryCard
          title="Total gold"
          date={closing?.date}
          value={`${closingGold.toFixed(2)} g`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FAF7F2',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 14,
    marginHorizontal: -16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: SDK_COLORS.borderCream,
    shadowColor: '#BC8100',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  panelTitleAccent: {
    color: SDK_COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  gap: {
    width: 10,
  },
  card: {
    flex: 1,
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F9D58C',
    padding: 12,
    minHeight: 100,
  },
  cardAccent: {
    borderColor: SDK_COLORS.primary,
  },
  cardTitle: {
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 6,
  },
  datePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 10,
    color: SDK_COLORS.textMutedDark,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
});
