import { ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { createEmptyWorkShiftInput, workPlatformKeys, type WorkPlatformKey, type WorkShiftCreateInput } from '../domain/workShiftCreate';
import { useWorkShiftCreate } from '../hooks/useWorkShiftCreate';

type Props = { onCancel: () => void };
const metricKeys = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;

function parseNumber(value: string): number { return value.trim() === '' ? Number.NaN : Number(value); }

export function WorkShiftCreateForm({ onCancel }: Props) {
  const { submit, reconcile, reset, status } = useWorkShiftCreate();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [input, setInput] = useState<WorkShiftCreateInput>(createEmptyWorkShiftInput);
  const pending = status === 'submitting';
  const requiresReconciliation = status === 'reconciliation_required';

  useEffect(() => {
    if (status === 'success') onCancel();
  }, [onCancel, status]);

  function updatePlatform(platform: WorkPlatformKey, patch: Partial<WorkShiftCreateInput['platforms'][WorkPlatformKey]>) {
    setInput((current) => ({ ...current, platforms: { ...current.platforms, [platform]: { ...current.platforms[platform], ...patch } } }));
  }
  async function submitForm() { await submit(input); }
  function cancel() { reset(); onCancel(); }

  const statusKey = status === 'validation_error' ? 'work.create.validation' : status === 'duplicate_date' ? 'work.create.duplicate' : status === 'recoverable_error' ? 'work.create.recoverable' : status === 'reconciliation_required' ? 'work.create.reconciliation' : status === 'blocked' ? 'work.create.blocked' : status === 'success' ? 'work.create.success' : null;
  return <Screen><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
    <AppText variant="title">{t('work.create.title')}</AppText>
    <AppInput label={t('work.create.date')} value={input.date} onChangeText={(date) => setInput((current) => ({ ...current, date }))} testID="work-create-date" />
    <AppInput label={t('work.create.km')} value={String(input.km)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...current, km: parseNumber(value) }))} testID="work-create-km" />
    <AppInput label={t('work.create.hours')} value={String(input.hours)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...current, hours: parseNumber(value) }))} testID="work-create-hours" />
    {workPlatformKeys.map((platform) => { const value = input.platforms[platform]; return <View key={platform} style={{ gap: spacing.xs }}>
      <AppButton label={t(`work.platform.${platform}`)} onPress={() => updatePlatform(platform, { enabled: !value.enabled })} testID={`work-platform-${platform}`} />
      {value.enabled ? <View style={{ gap: spacing.xs }}>
        {platform === 'other' ? <AppInput label={t('work.create.otherName')} value={input.platforms.other.name} onChangeText={(name) => updatePlatform('other', { name })} testID="work-other-name" /> : null}
        {metricKeys.map((metric) => <AppInput key={metric} label={t(`work.metric.${metric}`)} value={String(value[metric])} keyboardType="decimal-pad" onChangeText={(text) => updatePlatform(platform, { [metric]: parseNumber(text) })} testID={`work-${platform}-${metric}`} />)}
      </View> : null}
    </View>; })}
    {statusKey ? <AppText accessibilityRole="alert">{t(statusKey)}</AppText> : null}
    {requiresReconciliation ? <AppButton disabled={pending} label={t('work.create.reconcile')} onPress={() => void reconcile()} testID="work-create-reconcile" /> : <AppButton disabled={pending} label={t(pending ? 'work.create.submitting' : 'work.create.submit')} onPress={() => void submitForm()} testID="work-create-submit" />}
    <AppButton disabled={pending} label={t('work.create.cancel')} onPress={cancel} testID="work-create-cancel" />
  </ScrollView></Screen>;
}
