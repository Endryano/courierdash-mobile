import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type MoreSectionProps = PropsWithChildren<{
  title?: string;
}>;

export function MoreSection({ children, title }: MoreSectionProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {title ? <AppText accessibilityRole="header" variant="label">{title}</AppText> : null}
      {children}
    </View>
  );
}
