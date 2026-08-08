import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorkShiftFormShellProps = {
  title: string;
  children: ReactNode;
  message?: ReactNode;
  actions: ReactNode;
  testID?: string;
};

export function WorkShiftFormShell({ actions, children, message, testID, title }: WorkShiftFormShellProps) {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen edges={[]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.lg }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
          <AppText accessibilityRole="header" style={styles.title} variant="title">{title}</AppText>
          <View style={[styles.canvas, { gap: spacing.lg, marginTop: spacing.md }]}>
            {children}
            {message === undefined ? null : <View style={[styles.message, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radii.md, gap: spacing.xs, padding: spacing.md }]}>{message}</View>}
            <View style={{ gap: spacing.sm }} testID={testID === undefined ? undefined : `${testID}-actions`}>{actions}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvas: {},
  message: { borderWidth: 1.5 },
  title: { fontSize: 28, lineHeight: 34 },
});
