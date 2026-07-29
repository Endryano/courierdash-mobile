import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = TextInputProps & { label: string; error?: string; testID?: string };
export function AppInput({ label, error, testID, style, ...props }: Props) {
  const { colors, radii, spacing } = useTheme();
  return <View style={{ gap: spacing.xs }}><AppText variant="label">{label}</AppText><TextInput accessibilityLabel={label} testID={testID} placeholderTextColor={colors.textSecondary} style={[styles.input, { borderColor: error ? colors.accent : colors.border, borderRadius: radii.md, color: colors.textPrimary, paddingHorizontal: spacing.md }, style]} {...props} />{error ? <AppText muted accessibilityRole="alert">{error}</AppText> : null}</View>;
}
const styles = StyleSheet.create({ input: { borderWidth: 1, minHeight: 48 } });
