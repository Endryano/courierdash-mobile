import { View } from 'react-native';

import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

export type StatisticsMetricSectionItem = {
  readonly label: string;
  readonly value: string;
};

type StatisticsMetricSectionProps = {
  readonly title: string;
  readonly metrics: readonly StatisticsMetricSectionItem[];
};

export function StatisticsMetricSection({ metrics, title }: StatisticsMetricSectionProps) {
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
