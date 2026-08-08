import { ScrollView, View } from 'react-native';
import { useState, type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppSegmentedControlOption } from '@/components/ui/AppSegmentedControl';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardHeroCard } from '@/features/dashboard/components/DashboardHeroCard';
import { DashboardMetricStrip } from '@/features/dashboard/components/DashboardMetricStrip';
import { DashboardRecordGrid, type DashboardRecordGridItem } from '@/features/dashboard/components/DashboardRecordGrid';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { defaultDashboardPeriod, type DashboardPeriod } from '@/features/dashboard/domain/dashboardPeriod';
import { formatWorkShiftDate } from '@/features/work/domain/workShiftDate';
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

export { formatCurrency as formatDashboardCurrency, formatNumber as formatDashboardNumber } from '@/lib/formatters';

function splitCurrency(value: string): { readonly amount: string; readonly unit: string } {
  return { amount: value.replace(/^PLN[\s\u00A0]+|[\s\u00A0]+PLN$/u, ''), unit: 'PLN' };
}

function formatRecordCurrency(locale: Parameters<typeof formatCurrency>[0], value: number | null): { readonly amount: string; readonly unit?: string } {
  return value === null ? { amount: '—' } : splitCurrency(formatCurrency(locale, value));
}

function DashboardSection({ children, title }: { readonly children: ReactNode; readonly title: string }) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText accessibilityRole="header" style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16, textTransform: 'uppercase' }} variant="label">{title}</AppText>
      {children}
    </View>
  );
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
  const { colors, spacing } = useTheme();
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
  const operationalMetrics = [
    { accentColor: colors.accent, icon: 'receipt-outline' as const, key: 'orders', label: t('dashboard.label.orders'), value: formatNumber(locale, metrics.totalOrders, 0) },
    { accentColor: colors.positive, icon: 'time-outline' as const, key: 'hours', label: t('dashboard.label.hours'), value: formatNumber(locale, metrics.totalHours, 2) },
    { accentColor: colors.warning, icon: 'navigate-outline' as const, key: 'kilometers', label: t('dashboard.label.kilometers'), value: formatNumber(locale, metrics.totalKilometers, 2) },
    { accentColor: colors.textPrimary, icon: 'repeat-outline' as const, key: 'shifts', label: t('dashboard.label.shifts'), value: formatNumber(locale, metrics.totalShifts, 0) },
  ];
  const efficiencyMetrics = [
    { accentColor: colors.positive, icon: 'time-outline' as const, key: 'income-per-hour', label: t('dashboard.incomePerHour'), unit: incomePerHour.unit, value: incomePerHour.amount },
    { accentColor: colors.accent, icon: 'receipt-outline' as const, key: 'income-per-order', label: t('dashboard.incomePerOrder'), unit: incomePerOrder.unit, value: incomePerOrder.amount },
    { accentColor: colors.warning, icon: 'navigate-outline' as const, key: 'income-per-kilometer', label: t('dashboard.incomePerKilometer'), unit: incomePerKilometer.unit, value: incomePerKilometer.amount },
  ];
  const highestIncome = formatRecordCurrency(locale, records.highestIncome.value);
  const bestHourlyRate = formatRecordCurrency(locale, records.bestHourlyRate.value);
  const bestIncomePerKilometer = formatRecordCurrency(locale, records.bestIncomePerKilometer.value);
  const recordMetrics: readonly DashboardRecordGridItem[] = [
    { date: records.highestIncome.date === null ? undefined : formatWorkShiftDate(records.highestIncome.date, locale) ?? undefined, icon: 'trophy-outline', key: 'highest-income', label: t('dashboard.records.highestIncome'), unit: highestIncome.unit, value: highestIncome.amount },
    { date: records.bestHourlyRate.date === null ? undefined : formatWorkShiftDate(records.bestHourlyRate.date, locale) ?? undefined, icon: 'star-outline', key: 'best-hourly-rate', label: t('dashboard.records.bestHourlyRate'), unit: bestHourlyRate.unit === undefined ? undefined : t('dashboard.records.unit.perHour'), value: bestHourlyRate.amount },
    { date: records.mostOrders.date === null ? undefined : formatWorkShiftDate(records.mostOrders.date, locale) ?? undefined, icon: 'receipt-outline', key: 'most-orders', label: t('dashboard.records.mostOrders'), value: records.mostOrders.value === null ? '—' : formatNumber(locale, records.mostOrders.value, 0) },
    { date: records.bestIncomePerKilometer.date === null ? undefined : formatWorkShiftDate(records.bestIncomePerKilometer.date, locale) ?? undefined, icon: 'navigate-outline', key: 'best-income-per-kilometer', label: t('dashboard.records.bestIncomePerKilometer'), unit: bestIncomePerKilometer.unit === undefined ? undefined : t('dashboard.records.unit.perKilometer'), value: bestIncomePerKilometer.amount },
  ];

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={{ gap: 0, paddingBottom: 0, paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.md }} contentInsetAdjustmentBehavior="never">
        <DashboardHeader onChange={setPeriod} options={periodOptions} period={period} periodLabel={t('dashboard.period.label')} title={t('navigation.tab.dashboard')} />
        <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
          <AppText accessibilityRole="header" style={{ fontSize: 13, fontWeight: '600', letterSpacing: 0.8, lineHeight: 16, textTransform: 'uppercase' }} variant="label">{t('dashboard.section.income')}</AppText>
          <DashboardHeroCard label={t('dashboard.totalIncome')} unit={totalIncome.unit} value={totalIncome.amount} />
          <DashboardMetricStrip items={operationalMetrics} testID="dashboard-operational-strip" />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <DashboardSection title={t('dashboard.section.average')}>
            <DashboardMetricStrip items={efficiencyMetrics} testID="dashboard-efficiency-strip" />
          </DashboardSection>
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <DashboardSection title={t('dashboard.section.personalRecords')}>
            <DashboardRecordGrid items={recordMetrics} />
          </DashboardSection>
        </View>
      </ScrollView>
    </Screen>
  );
}
