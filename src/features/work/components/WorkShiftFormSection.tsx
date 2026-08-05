import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
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
    <View style={{ gap: spacing.sm }} testID={testID}>
      {title === undefined ? null : <AppText accessibilityRole="header" variant="body" style={{ fontSize: 27, fontWeight: '800', lineHeight: 32 }}>{title}</AppText>}
      <AppCard padding="lg" style={{ backgroundColor: '#25262d', borderColor: '#3a4a64', borderRadius: 24, borderWidth: 2, gap: spacing.lg }} variant="elevated">{children}</AppCard>
    </View>
  );
}
