import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'positive' | 'warning';

type AppButtonProps = Pick<PressableProps, 'onPress' | 'disabled' | 'testID'> & {
  label: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  accessibilityLabel?: string;
};

export function AppButton({ accessibilityLabel, disabled = false, label, loading = false, onPress, testID, variant = 'primary' }: AppButtonProps) {
  const { colors, radii, spacing } = useTheme();
  const isDisabled = disabled === true || loading;
  const isEmphasized = variant === 'primary' || variant === 'positive' || variant === 'warning';
  const textColor = isEmphasized ? colors.background : colors.textPrimary;

  function backgroundColor(pressed: boolean) {
    if (isDisabled) return isEmphasized ? colors.disabled : colors.surface;
    if (variant === 'primary') return pressed ? colors.accentPressed : colors.accent;
    if (variant === 'positive') return pressed ? colors.positivePressed : colors.positive;
    if (variant === 'warning') return pressed ? colors.warningPressed : colors.warning;
    if (variant === 'ghost') return pressed ? colors.surface : 'transparent';
    // Danger is intentionally a neutral provisional treatment until a semantic danger color is approved.
    return pressed ? colors.surfaceElevated : colors.surface;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={loading ? { disabled: true, busy: true } : { disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: backgroundColor(pressed),
          borderColor: isEmphasized ? 'transparent' : colors.border,
          borderWidth: isEmphasized ? 0 : StyleSheet.hairlineWidth,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
        },
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={textColor} size="small" /> : null}
        <AppText style={{ color: textColor }} variant="label">{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
