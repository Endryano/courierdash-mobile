import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { WorkPlatformKey } from '@/features/work/domain/workShiftAnalytics';
import { useTheme } from '@/theme/ThemeProvider';

import { StatisticsPlatformRow } from './StatisticsPlatformRow';

export type StatisticsPlatformDisplayItem = {
  readonly key: WorkPlatformKey;
  readonly label: string;
  readonly bruttoLabel: string;
  readonly bruttoValue: string;
  readonly ordersLabel: string;
  readonly ordersValue: string;
  readonly rawBrutto: number;
  readonly rawOrders: number;
};

type StatisticsPlatformListProps = {
  readonly title: string;
  readonly platforms: readonly StatisticsPlatformDisplayItem[];
};

export function StatisticsPlatformList({ platforms, title }: StatisticsPlatformListProps) {
  const { spacing } = useTheme();
  const activePlatforms = platforms.filter((platform) => platform.rawBrutto !== 0 || platform.rawOrders !== 0);

  if (activePlatforms.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText accessibilityRole="header" variant="label">{title}</AppText>
      <View style={{ gap: spacing.sm }}>
        {activePlatforms.map((platform) => (
          <StatisticsPlatformRow
            bruttoLabel={platform.bruttoLabel}
            bruttoValue={platform.bruttoValue}
            key={platform.key}
            label={platform.label}
            ordersLabel={platform.ordersLabel}
            ordersValue={platform.ordersValue}
            testID={`statistics-platform-${platform.key}`}
          />
        ))}
      </View>
    </View>
  );
}
