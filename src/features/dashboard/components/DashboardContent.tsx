import { ScrollView, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppSegmentedControlOption } from '@/components/ui/AppSegmentedControl';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardHeroCard } from '@/features/dashboard/components/DashboardHeroCard';
import { DashboardKpiGrid, type DashboardKpiItem } from '@/features/dashboard/components/DashboardKpiGrid';
import { DashboardMetricSection, type DashboardMetricSectionItem } from '@/features/dashboard/components/DashboardMetricSection';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { defaultDashboardPeriod, type DashboardPeriod } from '@/features/dashboard/domain/dashboardPeriod';
import { useLocalization } from '@/i18n/LocalizationProvider';
import type { TranslationKey } from '@/i18n/translations';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

const periodKeys: readonly DashboardPeriod[] = ['today', 'week', 'month', 'allTime'];

const periodTranslationKeys: Readonly<Record<DashboardPeriod, TranslationKey>> = {
  today: 'dashboard.period.today',
  week: 'dashboard.period.week',
  month: 'dashboard.period.month',
  allTime: 'dashboard.period.allTime',
};

const totalSectionHeadingKeys: Readonly<Record<DashboardPeriod, TranslationKey>> = {
  today: 'dashboard.section.total.today',
  week: 'dashboard.section.total.week',
  month: 'dashboard.section.total.month',
  allTime: 'dashboard.section.total.allTime',
};

export { formatCurrency as formatDashboardCurrency, formatNumber as formatDashboardNumber } from '@/lib/formatters';

function splitCurrency(value: string): { readonly amount: string; readonly unit: string } {
  return { amount: value.replace(/^PLN[\s\u00A0]+|[\s\u00A0]+PLN$/u, ''), unit: 'PLN' };
}

function formatRecordCurrency(locale: Parameters<typeof formatCurrency>[0], value: number | null): { readonly amount: string; readonly unit?: string } {
  return value === null ? { amount: '—' } : splitCurrency(formatCurrency(locale, value));
}

function DashboardMessage({ titleKey, descriptionKey, retry }: { readonly titleKey: TranslationKey; readonly descriptionKey: TranslationKey; readonly retry?: () => Promise<void> }) {
  const { t } = useLocalization();

  function retryDashboard() {
    if (retry === undefined) return;

    void retry().catch(() => {
      // WorkShiftsProvider publishes the safe error state after a failed canonical retry.
    });
  }

  return <Screen><AppStateSurface action={retry === undefined ? undefined : { label: t('dashboard.retry'), onPress: retryDashboard, testID: 'dashboard-retry' }} description={t(descriptionKey)} title={t(titleKey)} /></Screen>;
}

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>(defaultDashboardPeriod);
  const dashboard = useDashboardMetrics(period);
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const periodOptions: readonly AppSegmentedControlOption<DashboardPeriod>[] = periodKeys.map((option) => ({ label: t(periodTranslationKeys[option]), testID: `dashboard-period-${option}`, value: option }));

  if (dashboard.status === 'loading') {
    return <Screen><AppStateSurface loading title={t('dashboard.loading')} /></Screen>;
  }

  if (dashboard.status === 'empty') {
    return <DashboardMessage descriptionKey="dashboard.empty.description" titleKey="dashboard.empty.title" />;
  }

  if (dashboard.status === 'recoverable_error' || dashboard.status === 'blocked') {
    return <DashboardMessage descriptionKey="dashboard.error.description" retry={dashboard.retry} titleKey="dashboard.error.title" />;
  }

  if (dashboard.status === 'period_empty') {
    return (
      <Screen edges={[]}>
        <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: 0, paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.lg }} contentInsetAdjustmentBehavior="never">
          <DashboardHeader onChange={setPeriod} options={periodOptions} period={period} periodLabel={t('dashboard.period.label')} title={t('navigation.tab.dashboard')} />
          <View style={{ gap: spacing.xs }}>
            <AppText accessibilityRole="header" variant="title">{t('dashboard.periodEmpty.title')}</AppText>
            <AppText muted>{t('dashboard.periodEmpty.description')}</AppText>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const { metrics, records } = dashboard;
  const totalIncome = splitCurrency(formatCurrency(locale, metrics.totalIncome));
  const incomePerHour = splitCurrency(formatCurrency(locale, metrics.incomePerHour));
  const incomePerOrder = splitCurrency(formatCurrency(locale, metrics.incomePerOrder));
  const incomePerKilometer = splitCurrency(formatCurrency(locale, metrics.incomePerKilometer));
  const operationalMetrics: readonly DashboardKpiItem[] = [
    { key: 'orders', label: t('dashboard.label.orders'), tone: 'orders', value: formatNumber(locale, metrics.totalOrders, 0) },
    { key: 'hours', label: t('dashboard.label.hours'), unit: t('dashboard.unit.hours'), value: formatNumber(locale, metrics.totalHours, 2) },
    { key: 'kilometers', label: t('dashboard.label.kilometers'), tone: 'distance', unit: t('dashboard.unit.kilometers'), value: formatNumber(locale, metrics.totalKilometers, 2) },
    { key: 'shifts', label: t('dashboard.label.shifts'), tone: 'shifts', value: formatNumber(locale, metrics.totalShifts, 0) },
  ];
  const efficiencyMetrics: readonly DashboardMetricSectionItem[] = [
    { key: 'income-per-hour', label: t('dashboard.incomePerHour'), tone: 'income', unit: incomePerHour.unit, value: incomePerHour.amount },
    { key: 'income-per-order', label: t('dashboard.incomePerOrder'), tone: 'orders', unit: incomePerOrder.unit, value: incomePerOrder.amount },
    { key: 'income-per-kilometer', label: t('dashboard.incomePerKilometer'), tone: 'distance', unit: incomePerKilometer.unit, value: incomePerKilometer.amount },
  ];
  const highestIncome = formatRecordCurrency(locale, records.highestIncome);
  const bestHourlyRate = formatRecordCurrency(locale, records.bestHourlyRate);
  const bestIncomePerKilometer = formatRecordCurrency(locale, records.bestIncomePerKilometer);
  const recordMetrics: readonly DashboardMetricSectionItem[] = [
    { key: 'highest-income', label: t('dashboard.records.highestIncome'), tone: 'record', unit: highestIncome.unit, value: highestIncome.amount },
    { key: 'best-hourly-rate', label: t('dashboard.records.bestHourlyRate'), tone: 'record', unit: bestHourlyRate.unit === undefined ? undefined : t('dashboard.records.unit.perHour'), value: bestHourlyRate.amount },
    { key: 'most-orders', label: t('dashboard.records.mostOrders'), tone: 'record', value: records.mostOrders === null ? '—' : formatNumber(locale, records.mostOrders, 0) },
    { key: 'best-income-per-kilometer', label: t('dashboard.records.bestIncomePerKilometer'), tone: 'record', unit: bestIncomePerKilometer.unit === undefined ? undefined : t('dashboard.records.unit.perKilometer'), value: bestIncomePerKilometer.amount },
  ];

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={{ gap: 0, paddingBottom: 0, paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.md }} contentInsetAdjustmentBehavior="never">
        <DashboardHeader onChange={setPeriod} options={periodOptions} period={period} periodLabel={t('dashboard.period.label')} title={t('navigation.tab.dashboard')} />
        <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
          <AppText accessibilityRole="header" style={{ fontSize: 13, fontWeight: '600', letterSpacing: 0.8, lineHeight: 16, textTransform: 'uppercase' }} variant="label">{t(totalSectionHeadingKeys[period])}</AppText>
          <DashboardHeroCard label={t('dashboard.totalIncome')} unit={totalIncome.unit} value={totalIncome.amount} />
          <DashboardKpiGrid items={operationalMetrics} />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <DashboardMetricSection metrics={efficiencyMetrics} title={t('dashboard.section.average')} />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <DashboardMetricSection metrics={recordMetrics} title={t('dashboard.section.personalRecords')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
