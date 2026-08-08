import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ComponentProps } from 'react';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type DashboardRecordGridItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly date?: string;
  readonly icon: IoniconName;
};

type DashboardRecordGridProps = {
  readonly items: readonly DashboardRecordGridItem[];
};

export function DashboardRecordGrid({ items }: DashboardRecordGridProps) {
  const { fontScale, width } = useWindowDimensions();
  const { colors, spacing } = useTheme();
  const twoColumns = fontScale <= 1 && width >= 300;
  const itemWidth = twoColumns ? (width - spacing.md * 2 - spacing.xs) / 2 : width - spacing.md * 2;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }} testID="dashboard-record-grid">
      {items.map((item) => (
        <AppCard accessibilityLabel={`${item.label}: ${item.value}${item.unit === undefined ? '' : ` ${item.unit}`}${item.date === undefined ? '' : `. ${item.date}`}`} key={item.key} padding="none" style={[styles.card, { gap: spacing.xxs, width: itemWidth }]} testID={`dashboard-record-${item.key}`} variant="elevated">
          <Ionicons color={colors.warning} name={item.icon} size={16} />
          <AppText muted numberOfLines={1} style={styles.label} variant="caption">{item.label}</AppText>
          <View style={styles.valueRow}>
            <AppText adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.value, { color: colors.warning }]} variant="body">{item.value}</AppText>
            {item.unit === undefined ? null : <AppText muted numberOfLines={1} style={styles.unit} variant="caption">{item.unit}</AppText>}
          </View>
          {item.date === undefined ? null : <AppText muted numberOfLines={1} style={styles.date} variant="caption">{item.date}</AppText>}
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', minHeight: 108, paddingHorizontal: 8, paddingVertical: 10 },
  date: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
  label: { fontSize: 10, fontWeight: '600', lineHeight: 13, textAlign: 'center', textTransform: 'uppercase' },
  unit: { fontSize: 10, fontWeight: '600', lineHeight: 13 },
  value: { fontSize: 20, fontWeight: '800', lineHeight: 24, textAlign: 'center' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 2, justifyContent: 'center', maxWidth: '100%' },
});
