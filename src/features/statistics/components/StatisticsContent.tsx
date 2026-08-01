import { ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppCard } from '@/components/ui/AppCard';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
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

import type { StatisticsMetrics } from '../domain/statisticsMetrics';
import { useStatisticsMetrics } from '../hooks/useStatisticsMetrics';

type MetricCardProps = { readonly label: string; readonly value: string };

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
      onChange={onChange}
      options={periodKeys.map((option) => ({ label: t(periodTranslationKeys[option]), testID: `statistics-period-${option}`, value: option }))}
      value={period}
    />
  );
}

function PlatformBreakdown({ metrics }: { readonly metrics: StatisticsMetrics }) {
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="title">{t('statistics.platformBreakdown')}</AppText>
      {workPlatformKeys.map((platform) => {
        const item = metrics.platforms[platform];
        const label = t(platformTranslationKeys[platform]);
        const brutto = formatCurrency(locale, item.brutto);
        const orders = formatNumber(locale, item.orders, 0);

        return (
          <AppCard accessibilityLabel={`${label}: ${t('statistics.platform.brutto')} ${brutto}, ${t('statistics.platform.orders')} ${orders}`} key={platform} style={{ gap: spacing.xxs }}>
            <AppText variant="label">{label}</AppText>
            <AppText muted>{`${t('statistics.platform.brutto')}: ${brutto}`}</AppText>
            <AppText muted>{`${t('statistics.platform.orders')}: ${orders}`}</AppText>
          </AppCard>
        );
      })}
    </View>
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
      <Screen><View style={[styles.message, { gap: spacing.md, padding: spacing.xl }]}>
        <StatisticsPeriodSelector onChange={setPeriod} period={period} />
        <AppText variant="title">{t('statistics.periodEmpty.title')}</AppText>
        <AppText muted>{t('statistics.periodEmpty.description')}</AppText>
      </View></Screen>
    );
  }

  const { metrics } = statistics;
  const cards: readonly MetricCardProps[] = [
    { label: t('statistics.totalBrutto'), value: formatCurrency(locale, metrics.totalBrutto) },
    { label: t('statistics.baseIncome'), value: formatCurrency(locale, metrics.baseIncome) },
    { label: t('statistics.appTips'), value: formatCurrency(locale, metrics.appTips) },
    { label: t('statistics.cashTips'), value: formatCurrency(locale, metrics.cashTips) },
    { label: t('statistics.bonuses'), value: formatCurrency(locale, metrics.bonuses) },
    { label: t('statistics.orders'), value: formatNumber(locale, metrics.orders, 0) },
    { label: t('statistics.workedTime'), value: formatNumber(locale, metrics.workedTime, 2) },
    { label: t('statistics.distance'), value: formatNumber(locale, metrics.distance, 2) },
    { label: t('statistics.shiftCount'), value: formatNumber(locale, metrics.shiftCount, 0) },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
        <AppText variant="title">{t('statistics.title')}</AppText>
        <StatisticsPeriodSelector onChange={setPeriod} period={period} />
        <View style={{ gap: spacing.sm }}>{cards.map((card) => <AppMetricCard key={card.label} {...card} />)}</View>
        <PlatformBreakdown metrics={metrics} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    justifyContent: 'center',
  },
});
