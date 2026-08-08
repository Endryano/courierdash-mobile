import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type DashboardHeroCardProps = {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
};

export function DashboardHeroCard({ label, unit, value }: DashboardHeroCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <AppCard accessibilityLabel={`${label}: ${value}`} padding="md" style={[styles.card, { borderColor: '#27354a', gap: spacing.xs }]} variant="elevated">
      <View style={styles.content}>
        <AppText muted style={styles.label} variant="label">{label}</AppText>
        <View style={styles.valueRow}>
          <AppText style={[styles.value, { color: colors.positive }]} variant="title">{value}</AppText>
          {unit === undefined ? null : <AppText muted style={styles.unit} variant="body">{unit}</AppText>}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, minHeight: 108 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, lineHeight: 16, textTransform: 'uppercase' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 6 },
  value: { fontSize: 34, fontWeight: '800', lineHeight: 40 },
  unit: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
});
