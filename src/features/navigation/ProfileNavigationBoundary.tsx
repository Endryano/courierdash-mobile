import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useProfile } from '@/features/profile/useProfile';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

type ProfileNavigationBoundaryProps = {
  kind: 'recoverable_error' | 'blocked';
};

export function ProfileNavigationBoundary({ kind }: ProfileNavigationBoundaryProps) {
  const { retry } = useProfile();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const isBlocked = kind === 'blocked';

  async function retryProfile() {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <AppText variant="title">{t(isBlocked ? 'navigation.blocked.title' : 'navigation.profileError.title')}</AppText>
        <AppText muted>{t(isBlocked ? 'navigation.blocked.description' : 'navigation.profileError.description')}</AppText>
        <AppButton
          disabled={isRetrying}
          label={t(isRetrying ? 'navigation.retrying' : 'navigation.retry')}
          onPress={() => void retryProfile()}
          testID="profile-navigation-retry"
        />
      </View>
    </Screen>
  );
}
