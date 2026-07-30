import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { defaultDashboardPeriod, type DashboardPeriod } from '@/features/dashboard/domain/dashboardPeriod';
import { useLocalization } from '@/i18n/LocalizationProvider';
import type { TranslationKey } from '@/i18n/translations';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

type MetricCardProps = {
  readonly label: string;
  readonly value: string;
};

const periodKeys: readonly DashboardPeriod[] = ['today', 'week', 'month', 'allTime'];

const periodTranslationKeys: Readonly<Record<DashboardPeriod, TranslationKey>> = {
  today: 'dashboard.period.today',
  week: 'dashboard.period.week',
  month: 'dashboard.period.month',
  allTime: 'dashboard.period.allTime',
};

export { formatCurrency as formatDashboardCurrency, formatNumber as formatDashboardNumber } from '@/lib/formatters';

function MetricCard({ label, value }: MetricCardProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View accessibilityLabel={`${label}: ${value}`} style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md }]}>
      <AppText muted variant="label">{label}</AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

function DashboardMessage({ titleKey, descriptionKey, retry }: { readonly titleKey: TranslationKey; readonly descriptionKey: TranslationKey; readonly retry?: () => Promise<void> }) {
  const { t } = useLocalization();
  const { spacing } = useTheme();

  function retryDashboard() {
    if (retry === undefined) return;

    void retry().catch(() => {
      // WorkShiftsProvider publishes the safe error state after a failed canonical retry.
    });
  }

  return (
    <Screen><View style={[styles.message, { gap: spacing.md, padding: spacing.xl }]}>
      <AppText variant="title">{t(titleKey)}</AppText>
      <AppText muted>{t(descriptionKey)}</AppText>
      {retry === undefined ? null : <AppButton label={t('dashboard.retry')} onPress={retryDashboard} testID="dashboard-retry" />}
    </View></Screen>
  );
}

function DashboardPeriodSelector({ period, onChange }: { readonly period: DashboardPeriod; readonly onChange: (period: DashboardPeriod) => void }) {
  const { t } = useLocalization();
  const { colors, radii, spacing } = useTheme();

  return (
    <View accessibilityRole="tablist" style={[styles.periodSelector, { gap: spacing.xs }]}>
      {periodKeys.map((option) => {
        const selected = option === period;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [styles.periodOption, { backgroundColor: selected ? colors.accent : colors.surface, borderColor: colors.border, borderRadius: radii.md, opacity: pressed ? 0.8 : 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}
            testID={`dashboard-period-${option}`}
          >
            <AppText muted={!selected} style={{ color: selected ? colors.background : undefined }} variant="label">{t(periodTranslationKeys[option])}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>(defaultDashboardPeriod);
  const dashboard = useDashboardMetrics(period);
  const { locale, t } = useLocalization();
  const { spacing } = useTheme();

  if (dashboard.status === 'loading') {
    return <Screen><View style={[styles.message, { padding: spacing.xl }]}><AppText>{t('dashboard.loading')}</AppText></View></Screen>;
  }

  if (dashboard.status === 'empty') {
    return <DashboardMessage descriptionKey="dashboard.empty.description" titleKey="dashboard.empty.title" />;
  }

  if (dashboard.status === 'recoverable_error' || dashboard.status === 'blocked') {
    return <DashboardMessage descriptionKey="dashboard.error.description" retry={dashboard.retry} titleKey="dashboard.error.title" />;
  }

  if (dashboard.status === 'period_empty') {
    return (
      <Screen><View style={[styles.message, { gap: spacing.md, padding: spacing.xl }]}>
        <DashboardPeriodSelector onChange={setPeriod} period={period} />
        <AppText variant="title">{t('dashboard.periodEmpty.title')}</AppText>
        <AppText muted>{t('dashboard.periodEmpty.description')}</AppText>
      </View></Screen>
    );
  }

  const { metrics } = dashboard;
  const cards: readonly MetricCardProps[] = [
    { label: t('dashboard.totalIncome'), value: formatCurrency(locale, metrics.totalIncome) },
    { label: t('dashboard.totalHours'), value: formatNumber(locale, metrics.totalHours, 2) },
    { label: t('dashboard.totalOrders'), value: formatNumber(locale, metrics.totalOrders, 0) },
    { label: t('dashboard.totalKilometers'), value: formatNumber(locale, metrics.totalKilometers, 2) },
    { label: t('dashboard.totalShifts'), value: formatNumber(locale, metrics.totalShifts, 0) },
    { label: t('dashboard.incomePerHour'), value: formatCurrency(locale, metrics.incomePerHour) },
    { label: t('dashboard.incomePerOrder'), value: formatCurrency(locale, metrics.incomePerOrder) },
    { label: t('dashboard.incomePerKilometer'), value: formatCurrency(locale, metrics.incomePerKilometer) },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
        <AppText variant="title">{t('dashboard.title')}</AppText>
        <DashboardPeriodSelector onChange={setPeriod} period={period} />
        <View style={{ gap: spacing.sm }}>
          {cards.map((card) => <MetricCard key={card.label} {...card} />)}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    justifyContent: 'center',
  },
  metricCard: {
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    minHeight: 76,
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodOption: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
