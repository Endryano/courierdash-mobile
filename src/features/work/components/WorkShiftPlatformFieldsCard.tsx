import type { ReactNode } from 'react';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type WorkShiftPlatformFieldsCardProps = {
  title: string;
  children: ReactNode;
  testID?: string;
};

export function WorkShiftPlatformFieldsCard({ children, testID, title }: WorkShiftPlatformFieldsCardProps) {
  const { spacing } = useTheme();

  return (
    <AppCard style={{ gap: spacing.md }} testID={testID}>
      <AppText variant="label">{title}</AppText>
      {children}
    </AppCard>
  );
}
