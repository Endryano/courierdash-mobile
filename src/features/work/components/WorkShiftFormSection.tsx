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
      {title === undefined ? null : <AppText variant="label">{title}</AppText>}
      <AppCard style={{ gap: spacing.md }}>{children}</AppCard>
    </View>
  );
}
