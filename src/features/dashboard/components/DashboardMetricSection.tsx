import { View } from 'react-native';

import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export type DashboardMetricSectionItem = {
  readonly label: string;
  readonly value: string;
};

type DashboardMetricSectionProps = {
  readonly title: string;
  readonly metrics: readonly DashboardMetricSectionItem[];
};

export function DashboardMetricSection({ metrics, title }: DashboardMetricSectionProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText accessibilityRole="header" variant="label">{title}</AppText>
      <View style={{ gap: spacing.sm }}>
        {metrics.map((metric) => <AppMetricCard key={metric.label} {...metric} />)}
      </View>
    </View>
  );
}
