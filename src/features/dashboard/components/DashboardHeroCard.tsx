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
  const { colors, spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${label}: ${value}. ${secondaryLabel}: ${secondaryValue}`} padding="lg" variant="elevated">
      <View style={{ gap: spacing.xs }}>
        <AppText muted variant="label">{label}</AppText>
        <AppText style={{ color: colors.accent, fontSize: 40, fontWeight: '700', lineHeight: 48 }} variant="title">{value}</AppText>
      </View>
      <View style={{ borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.xxs, marginTop: spacing.lg, paddingTop: spacing.sm }}>
        <AppText muted variant="caption">{secondaryLabel}</AppText>
        <AppText variant="body">{secondaryValue}</AppText>
      </View>
    </AppCard>
  );
}
