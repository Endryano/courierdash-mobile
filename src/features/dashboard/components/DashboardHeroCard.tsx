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
    <AppCard accessibilityLabel={`${label}: ${value}`} padding="none" style={[styles.card, { borderColor: '#27354a', gap: spacing.xxs }]} variant="elevated">
      <View style={styles.content}>
        <AppText muted style={styles.label} variant="label">{label}</AppText>
        <View style={styles.valueRow} testID="dashboard-hero-value-row">
          <AppText numberOfLines={1} style={[styles.value, { color: colors.positive }]} variant="title">{value}</AppText>
          {unit === undefined ? null : <AppText muted numberOfLines={1} style={styles.unit} variant="body">{unit}</AppText>}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, minHeight: 116, paddingHorizontal: 16, paddingVertical: 12 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, lineHeight: 14, textTransform: 'uppercase' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 6, justifyContent: 'center', width: '100%' },
  value: { fontSize: 38, fontWeight: '800', lineHeight: 44 },
  unit: { flexShrink: 0, fontSize: 13, fontWeight: '600', lineHeight: 17 },
});
