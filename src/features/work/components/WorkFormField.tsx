import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type BaseProps = { label: string; error?: string; testID: string };
type InputProps = BaseProps & TextInputProps & { kind?: 'input' };
type TriggerProps = BaseProps & { kind: 'trigger'; value: string; onPress: () => void; disabled?: boolean };

export function WorkFormField(props: InputProps | TriggerProps) {
  const { colors, spacing } = useTheme();
  const { error, label, testID } = props;

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText muted style={styles.label}>{label}</AppText>
      {props.kind === 'trigger' ? (
        <Pressable accessibilityLabel={`${label}: ${props.value}`} accessibilityRole="button" accessibilityState={{ disabled: props.disabled === true }} disabled={props.disabled} onPress={props.onPress} style={({ pressed }) => [styles.field, { backgroundColor: colors.surface, borderColor: error ? '#d84d5d' : colors.border, opacity: pressed ? 0.8 : 1 }]} testID={testID}>
          <AppText style={styles.value}>{props.value}</AppText>
        </Pressable>
      ) : (
        <WorkFormTextInput {...props} />
      )}
      {error ? <AppText accessibilityRole="alert" style={{ color: '#f57b88' }} variant="caption">{error}</AppText> : null}
    </View>
  );
}

function WorkFormTextInput({ error, kind: _kind, label, onBlur, onFocus, style, testID, ...nativeProps }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return <TextInput {...nativeProps} accessibilityLabel={label} onBlur={(event) => { setFocused(false); onBlur?.(event); }} onFocus={(event) => { setFocused(true); onFocus?.(event); }} placeholderTextColor={colors.textSecondary} style={[styles.field, { backgroundColor: colors.surface, borderColor: error ? '#d84d5d' : focused ? colors.accent : colors.border, color: colors.textPrimary }, style]} testID={testID} />;
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  field: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, fontSize: 17, fontWeight: '600', justifyContent: 'center', minHeight: 52, paddingHorizontal: 14 },
  value: { fontSize: 18, fontWeight: '600' },
});
