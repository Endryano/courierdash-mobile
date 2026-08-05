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
    <AppCard style={{ backgroundColor: '#22232a', borderColor: accentColor, borderRadius: 24, borderWidth: 2.5, gap: spacing.lg, padding: spacing.lg }} testID={testID} variant="elevated">
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText style={{ fontSize: 25, fontWeight: '800' }} variant="body">{title}</AppText>
        <Pressable accessibilityLabel={removeAccessibilityLabel} accessibilityRole="button" onPress={onRemove} style={({ pressed }) => [styles.remove, { borderColor: '#53627a', borderRadius: radii.full, opacity: pressed ? 0.7 : 1 }]} testID={`${testID}-remove`}>
          <AppText style={{ color: colors.textSecondary, fontSize: 24, lineHeight: 28 }}>×</AppText>
        </Pressable>
      </View>
      <View style={{ backgroundColor: '#3b4b65', height: 1 }} />
      {children}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsExpanded }} onPress={onToggleDetails} style={({ pressed }) => ({ alignSelf: 'flex-start', backgroundColor: '#182a3b', borderColor: '#285b8d', borderRadius: 14, borderWidth: 1.5, minHeight: 48, justifyContent: 'center', opacity: pressed ? 0.7 : 1, paddingHorizontal: spacing.md })} testID={`${testID}-details-toggle`}>
        <AppText style={{ color: '#4ea5ff', fontWeight: '700' }}>{detailsLabel}</AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  remove: { alignItems: 'center', borderWidth: 1.5, height: 42, justifyContent: 'center', width: 42 },
});
