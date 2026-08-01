import { View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

import type { SafeShiftSummary } from '../domain/workShiftDelete';
import { formatWorkShiftDate } from '../domain/workShiftDate';

type WorkShiftDeleteSummaryProps = {
  readonly summary: SafeShiftSummary;
};

export function WorkShiftDeleteSummary({ summary }: WorkShiftDeleteSummaryProps) {
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();
  const date = formatWorkShiftDate(summary.date, locale) ?? t('work.date.invalid');
  const hours = formatNumber(locale, summary.hours, 2);
  const kilometres = formatNumber(locale, summary.km, 2);

  return (
    <AppCard padding="md" testID="work-delete-summary">
      <View style={{ gap: spacing.sm }}>
        <View style={{ gap: spacing.xxs }}>
          <AppText muted variant="caption">{t('work.create.date')}</AppText>
          <AppText>{date}</AppText>
        </View>
        <View style={{ gap: spacing.xxs }}>
          <AppText muted variant="caption">{t('work.shift.hours')}</AppText>
          <AppText>{hours}</AppText>
        </View>
        <View style={{ gap: spacing.xxs }}>
          <AppText muted variant="caption">{t('work.shift.km')}</AppText>
          <AppText>{kilometres}</AppText>
        </View>
      </View>
    </AppCard>
  );
}
