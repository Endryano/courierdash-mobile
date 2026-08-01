import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

type AppStateAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

type AppStateSurfaceProps = {
  title?: string;
  description?: string;
  action?: AppStateAction;
  loading?: boolean;
  children?: ReactNode;
  accessibilityLabel?: string;
};

export function AppStateSurface({ accessibilityLabel, action, children, description, loading = false, title }: AppStateSurfaceProps) {
  const { colors, spacing } = useTheme();

  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.surface, { gap: spacing.md, padding: spacing.xl }]}>
      {loading ? <ActivityIndicator accessibilityRole="progressbar" color={colors.accent} testID="app-state-loading" /> : null}
      {title === undefined ? null : <AppText variant="title">{title}</AppText>}
      {description === undefined ? null : <AppText muted>{description}</AppText>}
      {children}
      {action === undefined ? null : <AppButton disabled={action.disabled} label={action.label} onPress={action.onPress} testID={action.testID} />}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    justifyContent: 'center',
  },
});
