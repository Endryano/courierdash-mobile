import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

type AppButtonProps = Pick<PressableProps, 'onPress' | 'disabled' | 'testID'> & {
  label: string;
};

export function AppButton({ disabled = false, label, onPress, testID }: AppButtonProps) {
  const { colors, radii, spacing } = useTheme();
  const isDisabled = disabled === true;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDisabled ? colors.disabled : pressed ? colors.accentPressed : colors.accent,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
        },
      ]}
      testID={testID}
    >
      <AppText style={{ color: colors.background }} variant="label">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
