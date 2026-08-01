import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/ThemeProvider';

export type AuthMode = 'login' | 'signup';

type AuthShellProps = PropsWithChildren<{
  activeMode: AuthMode;
  brand: string;
  loginLabel: string;
  signupLabel: string;
  onModeChange: (mode: AuthMode) => void;
  title: string;
}>;

export function AuthShell({ activeMode, brand, children, loginLabel, onModeChange, signupLabel, title }: AuthShellProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: spacing.lg }} testID="auth-shell">
            <AppText style={{ color: colors.accent }} variant="title">{brand}</AppText>
            <View style={{ width: '100%' }}>
              <AppSegmentedControl
                accessibilityLabel={brand}
                onChange={onModeChange}
                options={[
                  { label: loginLabel, testID: 'auth-mode-login', value: 'login' },
                  { label: signupLabel, testID: 'auth-mode-signup', value: 'signup' },
                ]}
                value={activeMode}
              />
            </View>
            <AppCard padding="lg" style={{ gap: spacing.md, width: '100%' }} testID="auth-card">
              <View style={{ justifyContent: 'center', minHeight: typography.title.lineHeight * 2 }}>
                <AppText variant="title">{title}</AppText>
              </View>
              {children}
            </AppCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
