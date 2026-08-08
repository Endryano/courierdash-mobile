import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type WorkShiftFormSectionProps = {
  title?: string;
  children: ReactNode;
  testID?: string;
};

export function WorkShiftFormSection({ children, testID, title }: WorkShiftFormSectionProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radii.lg, gap: spacing.sm, padding: spacing.md }]} testID={testID}>
      {title === undefined ? null : <AppText accessibilityRole="header" variant="label" style={styles.title}>{title}</AppText>}
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ section: { borderWidth: StyleSheet.hairlineWidth }, title: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, lineHeight: 16, textTransform: 'uppercase' } });
