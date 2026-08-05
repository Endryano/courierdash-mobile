import { ScrollView, View } from 'react-native';
import { useState } from 'react';

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

export { formatCurrency as formatDashboardCurrency, formatNumber as formatDashboardNumber } from '@/lib/formatters';

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
      <Screen>
        <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
          <DashboardHeader onChange={setPeriod} options={periodOptions} period={period} periodLabel={t('dashboard.period.label')} title={t('dashboard.title')} />
          <View style={{ gap: spacing.xs }}>
            <AppText accessibilityRole="header" variant="title">{t('dashboard.periodEmpty.title')}</AppText>
            <AppText muted>{t('dashboard.periodEmpty.description')}</AppText>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const { metrics } = dashboard;
  const operationalMetrics: readonly DashboardKpiItem[] = [
    { key: 'hours', label: t('dashboard.totalHours'), value: formatNumber(locale, metrics.totalHours, 2) },
    { key: 'kilometers', label: t('dashboard.totalKilometers'), value: formatNumber(locale, metrics.totalKilometers, 2) },
    { key: 'orders', label: t('dashboard.totalOrders'), value: formatNumber(locale, metrics.totalOrders, 0) },
    { key: 'shifts', label: t('dashboard.totalShifts'), value: formatNumber(locale, metrics.totalShifts, 0) },
  ];
  const efficiencyMetrics: readonly DashboardMetricSectionItem[] = [
    { label: t('dashboard.incomePerOrder'), value: formatCurrency(locale, metrics.incomePerOrder) },
    { label: t('dashboard.incomePerKilometer'), value: formatCurrency(locale, metrics.incomePerKilometer) },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
        <DashboardHeader onChange={setPeriod} options={periodOptions} period={period} periodLabel={t('dashboard.period.label')} title={t('dashboard.title')} />
        <DashboardHeroCard label={t('dashboard.totalIncome')} secondaryLabel={t('dashboard.incomePerHour')} secondaryValue={formatCurrency(locale, metrics.incomePerHour)} value={formatCurrency(locale, metrics.totalIncome)} />
        <View style={{ gap: spacing.sm }}>
          <AppText accessibilityRole="header" variant="label">{t('dashboard.section.operational')}</AppText>
          <DashboardKpiGrid items={operationalMetrics} />
        </View>
        <DashboardMetricSection metrics={efficiencyMetrics} title={t('dashboard.section.efficiency')} />
      </ScrollView>
    </Screen>
  );
}
