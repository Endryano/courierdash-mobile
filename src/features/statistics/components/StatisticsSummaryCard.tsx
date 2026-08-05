import { View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type StatisticsSummaryCardProps = {
  readonly totalLabel: string;
  readonly totalValue: string;
  readonly secondaryLabel: string;
  readonly secondaryValue: string;
};

export function StatisticsSummaryCard({ secondaryLabel, secondaryValue, totalLabel, totalValue }: StatisticsSummaryCardProps) {
  const { spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${totalLabel}: ${totalValue}. ${secondaryLabel}: ${secondaryValue}`} padding="lg" testID="statistics-summary" variant="elevated">
      <View style={{ gap: spacing.xxs }}>
        <AppText muted variant="label">{totalLabel}</AppText>
        <AppText variant="title">{totalValue}</AppText>
      </View>
      <View style={{ gap: spacing.xxs, marginTop: spacing.lg }}>
        <AppText muted variant="caption">{secondaryLabel}</AppText>
        <AppText variant="body">{secondaryValue}</AppText>
      </View>
    </AppCard>
  );
}
