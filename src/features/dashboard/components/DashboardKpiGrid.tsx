import { useWindowDimensions, View } from 'react-native';

import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { useTheme } from '@/theme/ThemeProvider';

const minimumCardWidth = 140;

export type DashboardKpiItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly accessibilityLabel?: string;
};

export function resolveDashboardKpiGridColumns(availableWidth: number, fontScale: number, gap: number): 1 | 2 {
  return fontScale > 1 || availableWidth < minimumCardWidth * 2 + gap ? 1 : 2;
}

type DashboardKpiGridProps = {
  readonly items: readonly DashboardKpiItem[];
};

export function DashboardKpiGrid({ items }: DashboardKpiGridProps) {
  const { fontScale, width } = useWindowDimensions();
  const { spacing } = useTheme();
  const availableWidth = Math.max(0, width - spacing.xl * 2);
  const columns = resolveDashboardKpiGridColumns(availableWidth, fontScale, spacing.sm);
  const itemWidth = columns === 2 ? (availableWidth - spacing.sm) / 2 : availableWidth;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} testID="dashboard-kpi-grid">
      {items.map((item) => (
        <View key={item.key} style={{ width: itemWidth }}>
          <AppMetricCard accessibilityLabel={item.accessibilityLabel} label={item.label} testID={`dashboard-kpi-${item.key}`} value={item.value} />
        </View>
      ))}
    </View>
  );
}
