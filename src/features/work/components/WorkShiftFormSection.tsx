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
  const { spacing } = useTheme();

  return (
    <View style={[styles.section, { borderColor: '#3a4a64', gap: spacing.md, paddingTop: spacing.md }]} testID={testID}>
      {title === undefined ? null : <AppText accessibilityRole="header" variant="body" style={{ fontSize: 25, fontWeight: '800', lineHeight: 30 }}>{title}</AppText>}
      <View style={{ gap: spacing.md }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ section: { borderTopWidth: 1.5 } });
