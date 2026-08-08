import { setBackgroundColorAsync } from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
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

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <StatusBar style="light" />
      <NavigationGate />
    </View>
  );
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
