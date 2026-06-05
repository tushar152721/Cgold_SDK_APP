import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SDK_COLORS } from '../../constants';
import { formatStatementDisplayDate } from '../../utils/statementHistory';
import SdkStatementCalendar from './SdkStatementCalendar';

const QUICK_FILTERS = [
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
];

export default function SdkStatementDateRangeModal({
  visible,
  startDate,
  endDate,
  selectedQuickFilter,
  onClose,
  onStartDateChange,
  onEndDateChange,
  onQuickFilter,
  onDone,
}) {
  const today = new Date();
  const minDate = new Date(2022, 0, 1);
  const [visibleMonth, setVisibleMonth] = useState(
    startDate || endDate || today,
  );

  const handleDayPress = date => {
    if (!startDate || (startDate && endDate)) {
      onStartDateChange(date);
      onEndDateChange(null);
      return;
    }
    if (date >= startDate) {
      onEndDateChange(date);
    } else {
      onStartDateChange(date);
      onEndDateChange(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'fullScreen'}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={styles.card}>
            <Text style={styles.title}>Filter by date</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Start</Text>
                <Text style={styles.dateValue}>
                  {startDate
                    ? formatStatementDisplayDate(startDate)
                    : 'Select date'}
                </Text>
              </View>
              <Text style={styles.sep}>—</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>End</Text>
                <Text style={styles.dateValue}>
                  {endDate ? formatStatementDisplayDate(endDate) : 'Select date'}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}>
              {QUICK_FILTERS.map(chip => (
                <TouchableOpacity
                  key={chip.key}
                  style={[
                    styles.chip,
                    selectedQuickFilter === chip.key && styles.chipActive,
                  ]}
                  onPress={() => onQuickFilter(chip.days, chip.key)}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedQuickFilter === chip.key && styles.chipTextActive,
                    ]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <SdkStatementCalendar
              visibleMonth={visibleMonth}
              startDate={startDate}
              endDate={endDate}
              onMonthChange={setVisibleMonth}
              onDayPress={handleDayPress}
              minDate={minDate}
              maxDate={today}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.doneBtn,
                  (!startDate || !endDate) && styles.doneBtnDisabled,
                ]}
                disabled={!startDate || !endDate}
                onPress={onDone}>
                <Text style={styles.doneText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SDK_COLORS.textDark,
    marginBottom: 14,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: SDK_COLORS.borderCream,
  },
  dateLabel: {
    fontSize: 11,
    color: SDK_COLORS.textMutedDark,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  sep: {
    marginHorizontal: 8,
    color: SDK_COLORS.textMutedDark,
  },
  chips: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: SDK_COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: SDK_COLORS.textDark,
  },
  chipTextActive: {
    color: '#1A1A1A',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: SDK_COLORS.textMutedDark,
  },
  doneBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: SDK_COLORS.primary,
  },
  doneBtnDisabled: {
    opacity: 0.45,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
