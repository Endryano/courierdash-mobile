import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { NavigationGate } from '@/features/navigation/NavigationGate';
import { ProfileProvider } from '@/features/profile/ProfileProvider';
import { LocalizationProvider } from '@/i18n/LocalizationProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function SystemUiBackground() {
  const { colors } = useTheme();

  useEffect(() => {
    void setBackgroundColorAsync(colors.background).catch(() => {
      // System UI failure must not block application startup.
    });
  }, [colors.background]);

  return <NavigationGate />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <ProfileProvider>
              <SystemUiBackground />
            </ProfileProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
