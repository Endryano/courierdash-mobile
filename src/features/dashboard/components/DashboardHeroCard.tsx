import { View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type DashboardHeroCardProps = {
  readonly label: string;
  readonly value: string;
  readonly secondaryLabel: string;
  readonly secondaryValue: string;
};

export function DashboardHeroCard({ label, secondaryLabel, secondaryValue, value }: DashboardHeroCardProps) {
  const { spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${label}: ${value}. ${secondaryLabel}: ${secondaryValue}`} padding="lg" variant="elevated">
      <View style={{ gap: spacing.xxs }}>
        <AppText muted variant="label">{label}</AppText>
        <AppText variant="title">{value}</AppText>
      </View>
      <View style={{ gap: spacing.xxs, marginTop: spacing.lg }}>
        <AppText muted variant="caption">{secondaryLabel}</AppText>
        <AppText variant="body">{secondaryValue}</AppText>
      </View>
    </AppCard>
  );
}
