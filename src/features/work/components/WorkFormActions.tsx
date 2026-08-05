import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';

type Props = { primaryLabel: string; primaryTone: 'create' | 'update'; onPrimary: () => void; cancelLabel: string; onCancel: () => void; pending: boolean; testID: string; primaryTestID?: string };

export function WorkFormActions({ cancelLabel, onCancel, onPrimary, pending, primaryLabel, primaryTestID, primaryTone, testID }: Props) {
  const backgroundColor = primaryTone === 'create' ? '#00af42' : '#dc8b00';
  return <View style={styles.actions} testID={`${testID}-actions`}>
    <Pressable accessibilityLabel={primaryLabel} accessibilityRole="button" accessibilityState={pending ? { disabled: true, busy: true } : { disabled: false }} disabled={pending} onPress={onPrimary} style={({ pressed }) => [styles.primary, { backgroundColor, opacity: pressed || pending ? 0.75 : 1 }]} testID={primaryTestID ?? `${testID}-submit`}>
      {pending ? <ActivityIndicator color="#ffffff" /> : <AppText style={styles.primaryText}>{primaryLabel}</AppText>}
    </Pressable>
    <Pressable accessibilityLabel={cancelLabel} accessibilityRole="button" accessibilityState={{ disabled: pending }} disabled={pending} onPress={onCancel} style={({ pressed }) => [styles.cancel, { opacity: pressed || pending ? 0.75 : 1 }]} testID={`${testID}-cancel`}>
      <AppText style={styles.cancelText}>{cancelLabel}</AppText>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  actions: { gap: 14, marginTop: 8 },
  primary: { alignItems: 'center', borderRadius: 22, justifyContent: 'center', minHeight: 72, paddingHorizontal: 20 },
  primaryText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  cancel: { alignItems: 'center', backgroundColor: '#233044', borderColor: '#3b4b65', borderRadius: 22, borderWidth: 2, justifyContent: 'center', minHeight: 68, paddingHorizontal: 20 },
  cancelText: { color: '#fff', fontSize: 21, fontWeight: '700' },
});
