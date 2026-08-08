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
        <View style={styles.valueRow}>
          <AppText adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={[styles.value, { color: colors.positive }]} variant="title">{value}</AppText>
          {unit === undefined ? null : <AppText muted numberOfLines={1} style={styles.unit} variant="body">{unit}</AppText>}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, minHeight: 80, paddingHorizontal: 16, paddingVertical: 8 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, lineHeight: 14, textTransform: 'uppercase' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 6 },
  value: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  unit: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
});
