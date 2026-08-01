import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type AuthMessageProps = {
  message: string;
  role?: 'alert' | 'status';
};

export function AuthMessage({ message, role = 'alert' }: AuthMessageProps) {
  const { spacing } = useTheme();

  return (
    <AppCard padding="sm" style={{ gap: spacing.xxs }}>
      <AppText accessibilityLiveRegion={role === 'status' ? 'polite' : 'assertive'} accessibilityRole={role === 'alert' ? 'alert' : undefined} muted>{message}</AppText>
    </AppCard>
  );
}
