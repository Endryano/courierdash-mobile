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
    <AppCard style={{ borderColor: accentColor, borderWidth: 1.5, gap: spacing.md }} testID={testID} variant="elevated">
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText style={{ fontWeight: '700' }} variant="body">{title}</AppText>
        <Pressable accessibilityLabel={removeAccessibilityLabel} accessibilityRole="button" onPress={onRemove} style={({ pressed }) => [styles.remove, { borderColor: colors.border, borderRadius: radii.full, opacity: pressed ? 0.7 : 1 }]} testID={`${testID}-remove`}>
          <AppText style={{ color: colors.textSecondary, fontSize: 24, lineHeight: 28 }}>×</AppText>
        </Pressable>
      </View>
      {children}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsExpanded }} onPress={onToggleDetails} style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })} testID={`${testID}-details-toggle`}>
        <AppText style={{ color: colors.accent, fontWeight: '600' }}>{detailsLabel}</AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  remove: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, height: 36, justifyContent: 'center', width: 36 },
});
