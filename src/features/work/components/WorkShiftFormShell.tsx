import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/ThemeProvider';

type WorkShiftFormShellProps = {
  title: string;
  children: ReactNode;
  message?: ReactNode;
  actions: ReactNode;
  testID?: string;
};

export function WorkShiftFormShell({ actions, children, message, testID, title }: WorkShiftFormShellProps) {
  const { spacing } = useTheme();

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
          <AppText variant="title">{title}</AppText>
          {children}
          {message === undefined ? null : <View style={{ gap: spacing.xs }}>{message}</View>}
          <View style={{ gap: spacing.sm }} testID={testID === undefined ? undefined : `${testID}-actions`}>{actions}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
