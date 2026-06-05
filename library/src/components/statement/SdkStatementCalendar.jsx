import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SDK_COLORS } from '../../constants';
import { formatStatementDisplayDate } from '../../utils/statementHistory';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a, b) {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date, start, end) {
  if (!date || !start || !end) {
    return false;
  }
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export default function SdkStatementCalendar({
  visibleMonth,
  startDate,
  endDate,
  onMonthChange,
  onDayPress,
  minDate,
  maxDate,
}) {
  const month = visibleMonth.getMonth();
  const year = visibleMonth.getFullYear();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = [];

    for (let i = 0; i < startPad; i += 1) {
      rows.push({ key: `pad-${i}`, empty: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const disabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);
      const isStart = sameDay(date, startDate);
      const isEnd = sameDay(date, endDate);
      const inRange =
        startDate && endDate && isBetween(date, startDate, endDate);

      rows.push({
        key: `d-${day}`,
        day,
        date,
        disabled,
        isStart,
        isEnd,
        inRange,
      });
    }

    return rows;
  }, [month, year, startDate, endDate, minDate, maxDate]);

  const monthLabel = visibleMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onMonthChange(new Date(year, month - 1, 1))}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onMonthChange(new Date(year, month + 1, 1))}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(cell => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.cell} />;
          }

          const active = cell.isStart || cell.isEnd;
          return (
            <TouchableOpacity
              key={cell.key}
              style={[
                styles.cell,
                cell.inRange && styles.cellInRange,
                active && styles.cellActive,
                cell.disabled && styles.cellDisabled,
              ]}
              disabled={cell.disabled}
              onPress={() => onDayPress(cell.date)}>
              <Text
                style={[
                  styles.dayText,
                  active && styles.dayTextActive,
                  cell.disabled && styles.dayTextDisabled,
                ]}>
                {cell.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {(startDate || endDate) && (
        <Text style={styles.rangeHint}>
          {startDate ? formatStatementDisplayDate(startDate) : 'Start'} —{' '}
          {endDate ? formatStatementDisplayDate(endDate) : 'End'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 22,
    color: SDK_COLORS.textDark,
    lineHeight: 24,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  cellInRange: {
    backgroundColor: '#FDF3DD',
  },
  cellActive: {
    backgroundColor: SDK_COLORS.primary,
  },
  cellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 13,
    color: SDK_COLORS.textDark,
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: SDK_COLORS.textMutedDark,
  },
  rangeHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: SDK_COLORS.textMutedDark,
  },
});
