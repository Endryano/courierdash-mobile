import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { formatWorkShiftDate, fromCanonicalWorkShiftDate, toCanonicalWorkShiftDate } from '../domain/workShiftDate';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testID: string;
};

export function WorkShiftDateField({ label, value, onChange, testID }: Props) {
  const { locale, t } = useLocalization();
  const { colors, radii, spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState(() => fromCanonicalWorkShiftDate(value) ?? new Date());
  const selectedDate = fromCanonicalWorkShiftDate(value);
  const displayValue = formatWorkShiftDate(value, locale) ?? t('work.date.invalid');
  const isValid = selectedDate !== null;

  function openPicker() {
    if (selectedDate === null) return;
    setPendingDate(selectedDate);
    setIsOpen(true);
  }

  function closePicker() {
    setIsOpen(false);
  }

  function confirmPicker() {
    onChange(toCanonicalWorkShiftDate(pendingDate));
    closePicker();
  }

  function onPickerChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === 'android') {
      closePicker();
      if (event.type === 'set' && nextDate !== undefined) onChange(toCanonicalWorkShiftDate(nextDate));
      return;
    }
    if (nextDate !== undefined) setPendingDate(nextDate);
  }

  return <View style={{ gap: spacing.xs }}>
    <AppText variant="label">{label}</AppText>
    <Pressable
      accessibilityLabel={`${label}: ${displayValue}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isValid }}
      disabled={!isValid}
      onPress={openPicker}
      style={({ pressed }) => [{ minHeight: 60, justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, backgroundColor: pressed ? colors.surface : colors.surfaceElevated }]}
      testID={testID}
    >
      <AppText>{displayValue}</AppText>
    </Pressable>
    {isOpen ? <DateTimePicker mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onPickerChange} testID={`${testID}-picker`} value={pendingDate} /> : null}
    {isOpen && Platform.OS === 'ios' ? <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <AppButton label={t('work.date.cancel')} onPress={closePicker} testID={`${testID}-cancel`} />
      <AppButton label={t('work.date.confirm')} onPress={confirmPicker} testID={`${testID}-confirm`} />
    </View> : null}
  </View>;
}
