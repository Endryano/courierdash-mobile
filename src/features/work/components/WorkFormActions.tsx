import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = { primaryLabel: string; onPrimary: () => void; cancelLabel: string; onCancel: () => void; pending: boolean; testID: string; primaryTestID?: string };

export function WorkFormActions({ cancelLabel, onCancel, onPrimary, pending, primaryLabel, primaryTestID, testID }: Props) {
  const { colors, radii, spacing } = useTheme();
  const backgroundColor = colors.positive;

  return <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.xs }]} testID={`${testID}-actions`}>
    <Pressable accessibilityLabel={primaryLabel} accessibilityRole="button" accessibilityState={pending ? { disabled: true, busy: true } : { disabled: false }} disabled={pending} onPress={onPrimary} style={({ pressed }) => [styles.primary, { backgroundColor, borderRadius: radii.md, opacity: pressed || pending ? 0.75 : 1 }]} testID={primaryTestID ?? `${testID}-submit`}>
      {pending ? <ActivityIndicator color={colors.textPrimary} /> : <AppText style={[styles.primaryText, { color: colors.textPrimary }]}>{primaryLabel}</AppText>}
    </Pressable>
    <Pressable accessibilityLabel={cancelLabel} accessibilityRole="button" accessibilityState={{ disabled: pending }} disabled={pending} onPress={onCancel} style={({ pressed }) => [styles.cancel, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, opacity: pressed || pending ? 0.75 : 1 }]} testID={`${testID}-cancel`}>
      <AppText style={[styles.cancelText, { color: colors.textPrimary }]}>{cancelLabel}</AppText>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  actions: {},
  primary: { alignItems: 'center', justifyContent: 'center', minHeight: 56, paddingHorizontal: 20 },
  primaryText: { fontSize: 17, fontWeight: '800' },
  cancel: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 52, paddingHorizontal: 20 },
  cancelText: { fontSize: 16, fontWeight: '700' },
});
