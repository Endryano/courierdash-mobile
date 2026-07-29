import { Stack } from 'expo-router';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocalizationProvider, useLocalization } from '@/i18n/LocalizationProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProfileProvider } from '@/features/profile/ProfileProvider';
import { NicknameOnboardingScreen } from '@/features/profile/NicknameOnboardingScreen';
import { useProfile } from '@/features/profile/useProfile';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function RootNavigator() {
  const { colors } = useTheme();
  const { isReady } = useLocalization();
  const { status: profileStatus } = useProfile();

  useEffect(() => {
    void setBackgroundColorAsync(colors.background).catch(() => {
      // System UI failure must not block application startup.
    });
  }, [colors.background]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (profileStatus === 'needs_nickname') {
    return <NicknameOnboardingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <ProfileProvider>
              <RootNavigator />
            </ProfileProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
