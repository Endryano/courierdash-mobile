import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
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
  const { colors, radii, spacing } = useTheme();
  const date = formatWorkShiftDate(shift.date, locale) ?? t('work.date.invalid');
  const hours = formatNumber(locale, shift.hours, 2);
  const kilometres = formatNumber(locale, shift.km, 2);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          gap: spacing.sm,
          padding: spacing.md,
        },
      ]}
      testID={`work-shift-${shift.id}`}
    >
      <View style={{ gap: spacing.xxs }}>
        <AppText accessibilityLabel={`${t('work.create.date')}: ${date}`} variant="body">{date}</AppText>
        <AppText muted>{`${t('work.shift.hours')}: ${hours}`}</AppText>
        <AppText muted>{`${t('work.shift.km')}: ${kilometres}`}</AppText>
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppButton label={t('work.edit.action')} onPress={() => onEdit(shift.id)} testID={`work-edit-${shift.id}`} />
        <AppButton label={t('work.delete.action')} onPress={() => onDelete(shift)} testID={`work-delete-${shift.id}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
