import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

export type AppInputVariant = 'default' | 'filled';

type Props = TextInputProps & { label: string; error?: string; testID?: string; variant?: AppInputVariant };

export function AppInput({ label, error, testID, style, variant = 'default', ...props }: Props) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: variant === 'filled' ? colors.surfaceElevated : 'transparent',
            borderColor: error ? colors.accent : colors.border,
            borderRadius: radii.md,
            color: colors.textPrimary,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
        testID={testID}
      />
      {error ? <AppText accessibilityRole="alert" muted>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({ input: { borderWidth: 1, minHeight: 48 } });
