import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

import type { WorkShiftSummary } from '../domain/workShift';
import { formatWorkShiftDate } from '../domain/workShiftDate';

type WorkShiftListItemProps = {
  readonly shift: WorkShiftSummary;
  readonly onEdit: (shiftId: number) => void;
  readonly onDelete: (shift: WorkShiftSummary) => void;
};

export function WorkShiftListItem({ onDelete, onEdit, shift }: WorkShiftListItemProps) {
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();
  const date = formatWorkShiftDate(shift.date, locale) ?? t('work.date.invalid');
  const hours = formatNumber(locale, shift.hours, 2);
  const kilometres = formatNumber(locale, shift.km, 2);

  return (
    <AppCard padding="md" style={{ gap: spacing.md }} testID={`work-shift-${shift.id}`}>
      <View style={{ gap: spacing.xxs }}>
        <AppText accessibilityLabel={`${t('work.create.date')}: ${date}`} variant="body">{date}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <AppText accessibilityLabel={`${t('work.shift.hours')}: ${hours}`} muted variant="label">{`${t('work.shift.hours')}: ${hours}`}</AppText>
          <AppText accessibilityLabel={`${t('work.shift.km')}: ${kilometres}`} muted variant="label">{`${t('work.shift.km')}: ${kilometres}`}</AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppButton accessibilityLabel={t('work.edit.action')} label={t('work.edit.action')} onPress={() => onEdit(shift.id)} testID={`work-edit-${shift.id}`} variant="secondary" />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton accessibilityLabel={t('work.delete.action')} label={t('work.delete.action')} onPress={() => onDelete(shift)} testID={`work-delete-${shift.id}`} variant="danger" />
        </View>
      </View>
    </AppCard>
  );
}
