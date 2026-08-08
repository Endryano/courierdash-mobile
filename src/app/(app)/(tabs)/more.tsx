import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { AuthApiError } from '@/features/auth/authApi';
import { AuthMessage } from '@/features/auth/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { MoreAccountCard } from '@/features/more/components/MoreAccountCard';
import { MoreSection } from '@/features/more/components/MoreSection';
import { useProfile } from '@/features/profile/useProfile';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { useEffect, useRef, useState } from 'react';

export default function MoreRoute() {
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [pending, setPending] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();
  const mounted = useRef(true);
  const nickname = typeof profile?.nickname === 'string' && profile.nickname.trim().length > 0
    ? profile.nickname.trim()
    : undefined;
  const email = typeof user?.email === 'string' && user.email.trim().length > 0 ? user.email.trim() : undefined;

  useEffect(() => () => { mounted.current = false; }, []);

  async function handleSignOut() {
    if (pending) return;

    setSignOutError(undefined);
    setPending(true);

    try {
      await signOut();
    } catch (error) {
      if (mounted.current) {
        setSignOutError(t(error instanceof AuthApiError ? error.key : 'auth.error.generic'));
      }
    } finally {
      if (mounted.current) {
        setPending(false);
      }
    }
  }

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: spacing.xl, paddingBottom: 0, paddingHorizontal: spacing.xl, paddingTop: insets.top + spacing.xl }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
        <AppText accessibilityRole="header" variant="title">{t('navigation.more.title')}</AppText>
        {nickname ? <MoreSection><MoreAccountCard email={email} label={t('navigation.more.account')} nickname={nickname} /></MoreSection> : null}
        <MoreSection title={t('navigation.more.analytics')}>
          <AppButton label={t('navigation.more.statistics')} onPress={() => router.push('/statistics')} testID="more-statistics" variant="secondary" />
        </MoreSection>
        <MoreSection>
          <AppButton label={pending ? t('auth.loading') : t('auth.logout')} loading={pending} onPress={() => void handleSignOut()} testID="more-logout" variant="danger" />
          {signOutError ? <AuthMessage message={signOutError} /> : null}
        </MoreSection>
      </ScrollView>
    </Screen>
  );
}
