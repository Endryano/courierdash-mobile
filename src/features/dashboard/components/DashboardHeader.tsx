import { View } from 'react-native';

import { AppSegmentedControl, type AppSegmentedControlOption } from '@/components/ui/AppSegmentedControl';
import { AppText } from '@/components/ui/AppText';
import type { DashboardPeriod } from '@/features/dashboard/domain/dashboardPeriod';
import { useTheme } from '@/theme/ThemeProvider';

type DashboardHeaderProps = {
  readonly title: string;
  readonly periodLabel: string;
  readonly options: readonly AppSegmentedControlOption<DashboardPeriod>[];
  readonly period: DashboardPeriod;
  readonly onChange: (period: DashboardPeriod) => void;
};

export function DashboardHeader({ onChange, options, period, periodLabel, title }: DashboardHeaderProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText accessibilityRole="header" variant="title">{title}</AppText>
      <AppSegmentedControl accessibilityLabel={periodLabel} onChange={onChange} options={options} value={period} />
    </View>
  );
}
