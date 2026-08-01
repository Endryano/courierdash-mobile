import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { AuthApiError } from '@/features/auth/authApi';
import { AuthMessage } from '@/features/auth/AuthMessage';
import { useAuth } from '@/features/auth/useAuth';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { useEffect, useRef, useState } from 'react';

export default function MoreRoute() {
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();
  const mounted = useRef(true);

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
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: spacing.md, padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <AppText variant="title">{t('navigation.more.title')}</AppText>
        <AppText muted>{t('navigation.more.description')}</AppText>
        <AppButton label={t('navigation.more.statistics')} onPress={() => router.push('/statistics')} testID="more-statistics" />
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <AppButton label={pending ? t('auth.loading') : t('auth.logout')} loading={pending} onPress={() => void handleSignOut()} testID="more-logout" variant="danger" />
          {signOutError ? <AuthMessage message={signOutError} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
