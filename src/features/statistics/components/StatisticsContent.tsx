import { ScrollView, View } from 'react-native';
import { useState } from 'react';

import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { defaultWorkShiftPeriod, type WorkShiftPeriod } from '@/features/work/domain/workShiftPeriod';
import { workPlatformKeys, type WorkPlatformKey } from '@/features/work/domain/workShiftAnalytics';
import { useLocalization } from '@/i18n/LocalizationProvider';
import type { TranslationKey } from '@/i18n/translations';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

import { useStatisticsMetrics } from '../hooks/useStatisticsMetrics';
import { StatisticsMetricSection, type StatisticsMetricSectionItem } from './StatisticsMetricSection';
import { StatisticsPlatformList, type StatisticsPlatformDisplayItem } from './StatisticsPlatformList';
import { StatisticsSummaryCard } from './StatisticsSummaryCard';

const periodKeys: readonly WorkShiftPeriod[] = ['today', 'week', 'month', 'allTime'];

const periodTranslationKeys: Readonly<Record<WorkShiftPeriod, TranslationKey>> = {
  today: 'statistics.period.today',
  week: 'statistics.period.week',
  month: 'statistics.period.month',
  allTime: 'statistics.period.allTime',
};

const platformTranslationKeys: Readonly<Record<WorkPlatformKey, TranslationKey>> = {
  uber: 'work.platform.uber',
  wolt: 'work.platform.wolt',
  bolt: 'work.platform.bolt',
  glovo: 'work.platform.glovo',
  stuart: 'work.platform.stuart',
  other: 'work.platform.other',
};

function StatisticsMessage({ titleKey, descriptionKey, retry }: { readonly titleKey: TranslationKey; readonly descriptionKey: TranslationKey; readonly retry?: () => Promise<void> }) {
  const { t } = useLocalization();

  function retryStatistics() {
    if (retry === undefined) return;

    void retry().catch(() => {
      // WorkShiftsProvider publishes the next safe canonical state after retry.
    });
  }

  return <Screen><AppStateSurface action={retry === undefined ? undefined : { label: t('statistics.retry'), onPress: retryStatistics, testID: 'statistics-retry' }} description={t(descriptionKey)} title={t(titleKey)} /></Screen>;
}

function StatisticsPeriodSelector({ period, onChange }: { readonly period: WorkShiftPeriod; readonly onChange: (period: WorkShiftPeriod) => void }) {
  const { t } = useLocalization();

  return (
    <AppSegmentedControl
      accessibilityLabel={t('statistics.period.label')}
      appearance="filter"
      onChange={onChange}
      options={periodKeys.map((option) => ({ breakBefore: option === 'allTime', label: t(periodTranslationKeys[option]), testID: `statistics-period-${option}`, value: option }))}
      value={period}
    />
  );
}

export function StatisticsContent() {
  const [period, setPeriod] = useState<WorkShiftPeriod>(defaultWorkShiftPeriod);
  const statistics = useStatisticsMetrics(period);
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();

  if (statistics.status === 'loading') {
    return <Screen><AppStateSurface><AppText>{t('statistics.loading')}</AppText></AppStateSurface></Screen>;
  }
  if (statistics.status === 'empty') return <StatisticsMessage descriptionKey="statistics.empty.description" titleKey="statistics.empty.title" />;
  if (statistics.status === 'recoverable_error') return <StatisticsMessage descriptionKey="statistics.error.description" retry={statistics.retry} titleKey="statistics.error.title" />;
  if (statistics.status === 'blocked') return <StatisticsMessage descriptionKey="statistics.blocked.description" retry={statistics.retry} titleKey="statistics.blocked.title" />;
  if (statistics.status === 'period_empty') {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
          <AppText accessibilityRole="header" variant="title">{t('statistics.title')}</AppText>
          <StatisticsPeriodSelector onChange={setPeriod} period={period} />
          <View style={{ gap: spacing.xs }}>
            <AppText accessibilityRole="header" variant="title">{t('statistics.periodEmpty.title')}</AppText>
            <AppText muted>{t('statistics.periodEmpty.description')}</AppText>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const { metrics } = statistics;
  const incomeCompositionMetrics: readonly StatisticsMetricSectionItem[] = [
    { label: t('statistics.baseIncome'), value: formatCurrency(locale, metrics.baseIncome) },
    { label: t('statistics.appTips'), value: formatCurrency(locale, metrics.appTips) },
    { label: t('statistics.cashTips'), value: formatCurrency(locale, metrics.cashTips) },
    { label: t('statistics.bonuses'), value: formatCurrency(locale, metrics.bonuses) },
  ];
  const workContextMetrics: readonly StatisticsMetricSectionItem[] = [
    { label: t('statistics.workedTime'), value: formatNumber(locale, metrics.workedTime, 2) },
    { label: t('statistics.distance'), value: formatNumber(locale, metrics.distance, 2) },
    { label: t('statistics.shiftCount'), value: formatNumber(locale, metrics.shiftCount, 0) },
  ];
  const platforms: readonly StatisticsPlatformDisplayItem[] = workPlatformKeys.map((key) => {
    const platform = metrics.platforms[key];

    return {
      key,
      label: t(platformTranslationKeys[key]),
      bruttoLabel: t('statistics.platform.brutto'),
      bruttoValue: formatCurrency(locale, platform.brutto),
      ordersLabel: t('statistics.platform.orders'),
      ordersValue: formatNumber(locale, platform.orders, 0),
      rawBrutto: platform.brutto,
      rawOrders: platform.orders,
    };
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
        <AppText accessibilityRole="header" variant="title">{t('statistics.title')}</AppText>
        <StatisticsPeriodSelector onChange={setPeriod} period={period} />
        <StatisticsSummaryCard secondaryLabel={t('statistics.orders')} secondaryValue={formatNumber(locale, metrics.orders, 0)} totalLabel={t('statistics.totalBrutto')} totalValue={formatCurrency(locale, metrics.totalBrutto)} />
        <StatisticsMetricSection metrics={incomeCompositionMetrics} title={t('statistics.section.incomeComposition')} />
        <StatisticsMetricSection metrics={workContextMetrics} title={t('statistics.section.workContext')} />
        <StatisticsPlatformList platforms={platforms} title={t('statistics.platformBreakdown')} />
      </ScrollView>
    </Screen>
  );
}
