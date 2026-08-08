import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { DashboardKpiGrid, type DashboardKpiTone } from './DashboardKpiGrid';

export type DashboardMetricSectionItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly tone?: DashboardKpiTone;
};

type DashboardMetricSectionProps = {
  readonly title: string;
  readonly metrics: readonly DashboardMetricSectionItem[];
};

export function DashboardMetricSection({ metrics, title }: DashboardMetricSectionProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText accessibilityRole="header" style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16, textTransform: 'uppercase' }} variant="label">{title}</AppText>
      <DashboardKpiGrid items={metrics} />
    </View>
  );
}
