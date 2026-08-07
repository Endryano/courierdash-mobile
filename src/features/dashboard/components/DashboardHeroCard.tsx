import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type DashboardHeroCardProps = {
  readonly label: string;
  readonly value: string;
};

export function DashboardHeroCard({ label, value }: DashboardHeroCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${label}: ${value}`} padding="lg" style={[styles.card, { borderColor: '#27354a', gap: spacing.sm }]} variant="elevated">
      <View style={styles.content}>
        <AppText muted style={styles.label} variant="label">{label}</AppText>
        <AppText style={[styles.value, { color: colors.positive }]} variant="title">{value}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, minHeight: 150 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  value: { fontSize: 42, fontWeight: '800', lineHeight: 50 },
});
