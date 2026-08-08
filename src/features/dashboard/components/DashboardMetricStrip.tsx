import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ComponentProps } from 'react';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type DashboardMetricStripItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly icon: IoniconName;
  readonly accentColor: string;
};

type DashboardMetricStripProps = {
  readonly items: readonly DashboardMetricStripItem[];
  readonly testID: string;
};

export function DashboardMetricStrip({ items, testID }: DashboardMetricStripProps) {
  const { colors, spacing } = useTheme();

  return (
    <AppCard padding="none" style={styles.card} testID={testID} variant="elevated">
      {items.map((item, index) => (
        <View accessibilityLabel={`${item.label}: ${item.value}${item.unit === undefined ? '' : ` ${item.unit}`}`} key={item.key} style={[styles.item, { gap: spacing.xxs }, index === 0 ? undefined : { borderLeftColor: colors.border, borderLeftWidth: StyleSheet.hairlineWidth }]} testID={`${testID}-${item.key}`}>
          <Ionicons color={item.accentColor} name={item.icon} size={17} />
          <View style={styles.valueRow}>
            <AppText adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.value, { color: item.accentColor }]} variant="body">{item.value}</AppText>
            {item.unit === undefined ? null : <AppText muted numberOfLines={1} style={styles.unit} variant="caption">{item.unit}</AppText>}
          </View>
          <AppText muted numberOfLines={1} style={styles.label} variant="caption">{item.label}</AppText>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'stretch', flexDirection: 'row', minHeight: 92, overflow: 'hidden' },
  item: { alignItems: 'center', flex: 1, justifyContent: 'center', minWidth: 0, paddingHorizontal: 4, paddingVertical: 10 },
  label: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
  unit: { fontSize: 10, fontWeight: '600', lineHeight: 13 },
  value: { fontSize: 20, fontWeight: '800', lineHeight: 24, textAlign: 'center' },
  valueRow: { alignItems: 'baseline', flexDirection: 'row', gap: 2, justifyContent: 'center', maxWidth: '100%' },
});
