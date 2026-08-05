import { View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type StatisticsPlatformRowProps = {
  readonly label: string;
  readonly bruttoLabel: string;
  readonly bruttoValue: string;
  readonly ordersLabel: string;
  readonly ordersValue: string;
  readonly testID?: string;
};

export function StatisticsPlatformRow({ bruttoLabel, bruttoValue, label, ordersLabel, ordersValue, testID }: StatisticsPlatformRowProps) {
  const { spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${label}: ${bruttoLabel} ${bruttoValue}, ${ordersLabel} ${ordersValue}`} style={{ gap: spacing.xxs }} testID={testID}>
      <AppText variant="label">{label}</AppText>
      <View style={{ gap: spacing.xxs }}>
        <AppText muted>{`${bruttoLabel}: ${bruttoValue}`}</AppText>
        <AppText muted>{`${ordersLabel}: ${ordersValue}`}</AppText>
      </View>
    </AppCard>
  );
}
