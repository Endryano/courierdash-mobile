import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type WorkShiftPlatformFieldsCardProps = {
  title: string;
  children: ReactNode;
  testID?: string;
  onRemove: () => void;
  removeAccessibilityLabel: string;
  onToggleDetails: () => void;
  detailsExpanded: boolean;
  detailsLabel: string;
  accentColor: string;
};

export function getWorkPlatformAccent(platform: string): string {
  return {
    uber: '#46515f',
    wolt: '#00a9c5',
    bolt: '#22a65a',
    glovo: '#c28a12',
    stuart: '#dc4d56',
    other: '#8158c9',
  }[platform] ?? '#46515f';
}

export function WorkShiftPlatformFieldsCard({ accentColor, children, detailsExpanded, detailsLabel, onRemove, onToggleDetails, removeAccessibilityLabel, testID, title }: WorkShiftPlatformFieldsCardProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <AppCard style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, gap: spacing.sm, padding: spacing.md }} testID={testID} variant="elevated">
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.xs, minWidth: 0 }}>
          <View style={{ backgroundColor: accentColor, borderRadius: radii.full, height: 20, width: 3 }} />
          <AppText numberOfLines={1} style={styles.title} variant="body">{title}</AppText>
        </View>
        <Pressable accessibilityLabel={removeAccessibilityLabel} accessibilityRole="button" onPress={onRemove} style={({ pressed }) => [styles.remove, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radii.full, opacity: pressed ? 0.7 : 1 }]} testID={`${testID}-remove`}>
          <AppText style={{ color: colors.textSecondary, fontSize: 22, lineHeight: 26 }}>×</AppText>
        </Pressable>
      </View>
      <View style={{ backgroundColor: colors.border, height: StyleSheet.hairlineWidth }} />
      {children}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsExpanded }} onPress={onToggleDetails} style={({ pressed }) => ({ alignSelf: 'flex-start', backgroundColor: detailsExpanded ? '#17343a' : colors.surfaceElevated, borderColor: detailsExpanded ? colors.accent : colors.border, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 48, opacity: pressed ? 0.7 : 1, paddingHorizontal: spacing.md })} testID={`${testID}-details-toggle`}>
        <AppText style={{ color: detailsExpanded ? colors.accent : colors.textPrimary, fontWeight: '700' }}>{detailsLabel}</AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  remove: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, height: 48, justifyContent: 'center', width: 48 },
  title: { flexShrink: 1, fontSize: 17, fontWeight: '700', lineHeight: 22 },
});
