import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

const minimumCardWidth = 140;

export type DashboardKpiItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly accessibilityLabel?: string;
  readonly tone?: DashboardKpiTone;
};

export type DashboardKpiTone = 'default' | 'income' | 'orders' | 'distance' | 'shifts';

const toneStyles: Record<DashboardKpiTone, { readonly borderColor: string; readonly valueColor: string }> = {
  default: { borderColor: '#27354a', valueColor: '#ffffff' },
  income: { borderColor: '#285038', valueColor: '#20d879' },
  orders: { borderColor: '#2b3d5c', valueColor: '#579aff' },
  distance: { borderColor: '#443657', valueColor: '#bf78ff' },
  shifts: { borderColor: '#563541', valueColor: '#fa6784' },
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
  const availableWidth = Math.max(0, width - spacing.lg * 2);
  const columns = resolveDashboardKpiGridColumns(availableWidth, fontScale, spacing.sm);
  const itemWidth = columns === 2 ? (availableWidth - spacing.sm) / 2 : availableWidth;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} testID="dashboard-kpi-grid">
      {items.map(({ key, ...item }) => (
        <View key={key} style={{ width: itemWidth }}>
          <DashboardKpiCard {...item} testID={`dashboard-kpi-${key}`} />
        </View>
      ))}
    </View>
  );
}

type DashboardKpiCardProps = Omit<DashboardKpiItem, 'key'> & { readonly testID: string };

function DashboardKpiCard({ accessibilityLabel, label, testID, tone = 'default', unit, value }: DashboardKpiCardProps) {
  const { colors, spacing } = useTheme();
  const palette = toneStyles[tone];

  return (
    <AppCard accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`} padding="sm" style={[styles.card, { backgroundColor: colors.surface, borderColor: palette.borderColor, gap: spacing.xxs }]} testID={testID}>
      <AppText muted style={styles.label} variant="label">{label}</AppText>
      <View style={styles.valueRow}>
        <AppText style={[styles.value, { color: palette.valueColor }]} variant="body">{value}</AppText>
        {unit === undefined ? null : <AppText muted style={styles.unit} variant="body">{unit}</AppText>}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderRadius: 18, borderWidth: 1, justifyContent: 'center', minHeight: 92 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, lineHeight: 16, textAlign: 'center', textTransform: 'uppercase' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 4, justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '800', lineHeight: 31, textAlign: 'center' },
  unit: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
