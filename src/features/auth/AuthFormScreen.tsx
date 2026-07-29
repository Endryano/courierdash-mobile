import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
export function AuthFormScreen({ title, children }: PropsWithChildren<{ title: string }>) { const { spacing } = useTheme(); return <Screen><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}><ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }} keyboardShouldPersistTaps="handled"><View style={{ gap: spacing.md }}><AppText variant="title">{title}</AppText>{children}</View></ScrollView></KeyboardAvoidingView></Screen>; }
