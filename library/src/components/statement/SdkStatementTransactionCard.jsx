import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';
import { formatStatementDate } from '../../utils/statementHistory';
import SdkStatementListIcon from './SdkStatementListIcon';

function shortTxnId(id) {
  if (!id) {
    return '';
  }
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 8)}…` : s;
}

export default function SdkStatementTransactionCard({
  title,
  date,
  amountDisplay,
  priceHint,
  transactionNumber,
  transactionType,
  balanceLabel,
  balanceValue,
  status = 'Success',
}) {
  const isSuccess = String(status).toLowerCase() === 'success';
  const statusColor = isSuccess ? '#00A245' : '#FF1414';
  const statusBg = isSuccess ? '#E8F8EE' : '#FEE2E2';

  return (
    <View style={styles.card}>
      <View style={styles.leftPart}>
        <SdkStatementListIcon transactionType={transactionType} />

        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.amount}>{amountDisplay}</Text>
            {priceHint ? <Text style={styles.priceHint}>{priceHint}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {transactionNumber ? (
              <Text style={styles.txnId}>
                Transaction ID : {shortTxnId(transactionNumber)}
              </Text>
            ) : null}
            <Text style={styles.date}>{formatStatementDate(date)}</Text>
          </View>

          <View style={styles.rightPart}>
            <Text style={styles.balanceLabel}>{balanceLabel}</Text>
            <Text style={styles.balanceValue}>{balanceValue}</Text>
            <View style={[styles.statusRow, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isSuccess ? 'Success' : status}
              </Text>
              <Text style={[styles.check, { color: statusColor }]}>✓</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SDK_COLORS.cardCream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  leftPart: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
    minWidth: 0,
    gap: 6,
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  priceHint: {
    fontSize: 10,
    color: '#00A245',
    marginBottom: 4,
    lineHeight: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: '400',
    color: '#737373',
    marginBottom: 2,
  },
  txnId: {
    fontSize: 11,
    fontWeight: '400',
    color: '#737373',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    color: '#737373',
  },
  rightPart: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: '36%',
    minWidth: 82,
    marginLeft: 4,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#737373',
    marginBottom: 2,
    textAlign: 'right',
  },
  balanceValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 3,
  },
  check: {
    fontSize: 12,
    fontWeight: '700',
  },
});
