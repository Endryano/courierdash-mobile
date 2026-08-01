import { ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { workPlatformKeys, type WorkPlatformKey } from '../domain/workShiftCreate';
import { createEmptyWorkShiftCreateDraft, validateWorkShiftCreateDraft, type WorkShiftCreateDraft } from '../domain/workShiftCreateDraft';
import type { WorkShiftValidationError } from '../domain/workShiftValidation';
import { useWorkShiftCreate } from '../hooks/useWorkShiftCreate';
import { WorkShiftDateField } from './WorkShiftDateField';

type Props = { onCancel: () => void };
const metricKeys = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;

export function WorkShiftCreateForm({ onCancel }: Props) {
  const create = useWorkShiftCreate();
  const { submit, reconcile, reset, status } = create;
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [input, setInput] = useState<WorkShiftCreateDraft>(createEmptyWorkShiftCreateDraft);
  const [formError, setFormError] = useState<WorkShiftValidationError | null>(null);
  const pending = status === 'submitting';
  const requiresReconciliation = status === 'reconciliation_required';

  useEffect(() => {
    if (status !== 'success') return;

    reset();
    onCancel();
  }, [onCancel, reset, status]);

  function updatePlatform(platform: WorkPlatformKey, patch: Partial<WorkShiftCreateDraft['platforms'][WorkPlatformKey]>) {
    setFormError(null);
    setInput((current) => ({ ...current, platforms: { ...current.platforms, [platform]: { ...current.platforms[platform], ...patch } } }));
  }
  async function submitForm() {
    const validation = validateWorkShiftCreateDraft(input);
    if (!validation.isValid) { setFormError(validation.error); return; }
    setFormError(null);
    await submit(validation.value);
  }
  function cancel() { reset(); onCancel(); }

  const statusKey = formError !== null || status === 'validation_error' ? 'work.create.validation' : status === 'duplicate_date' ? 'work.create.duplicate' : status === 'recoverable_error' ? 'work.create.recoverable' : status === 'reconciliation_required' ? 'work.create.reconciliation' : status === 'blocked' ? 'work.create.blocked' : status === 'success' ? 'work.create.success' : null;
  const validationError = formError ?? (status === 'validation_error' ? create.error : null);
  const validationDetailKey = validationError === 'invalid_date' ? 'work.create.validation.date' : validationError === 'no_platform' ? 'work.create.validation.platform' : validationError === 'invalid_number' ? 'work.create.validation.number' : validationError === 'negative_number' ? 'work.create.validation.nonNegative' : validationError === 'fractional_orders' ? 'work.create.validation.ordersInteger' : validationError === 'other_name_required' ? 'work.create.validation.otherName' : null;
  return <Screen><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
    <AppText variant="title">{t('work.create.title')}</AppText>
    <WorkShiftDateField label={t('work.create.date')} value={input.date} onChange={(date) => { setFormError(null); setInput((current) => ({ ...current, date })); }} testID="work-create-date" />
    <AppInput label={t('work.create.km')} value={input.km} keyboardType="decimal-pad" onChangeText={(km) => { setFormError(null); setInput((current) => ({ ...current, km })); }} testID="work-create-km" />
    <AppInput label={t('work.create.hours')} value={input.hours} keyboardType="decimal-pad" onChangeText={(hours) => { setFormError(null); setInput((current) => ({ ...current, hours })); }} testID="work-create-hours" />
    {workPlatformKeys.map((platform) => { const value = input.platforms[platform]; return <View key={platform} style={{ gap: spacing.xs }}>
      <AppButton label={t(`work.platform.${platform}`)} onPress={() => updatePlatform(platform, { enabled: !value.enabled })} testID={`work-platform-${platform}`} />
      {value.enabled ? <View style={{ gap: spacing.xs }}>
        {platform === 'other' ? <AppInput label={t('work.create.otherName')} value={input.platforms.other.name} onChangeText={(name) => updatePlatform('other', { name })} testID="work-other-name" /> : null}
        {metricKeys.map((metric) => <AppInput key={metric} label={t(`work.metric.${metric}`)} value={value[metric]} keyboardType="decimal-pad" onChangeText={(text) => updatePlatform(platform, { [metric]: text })} testID={`work-${platform}-${metric}`} />)}
      </View> : null}
    </View>; })}
    {statusKey ? <AppText accessibilityRole="alert">{t(statusKey)}</AppText> : null}
    {validationDetailKey ? <AppText accessibilityRole="alert">{t(validationDetailKey)}</AppText> : null}
    {requiresReconciliation ? <AppButton disabled={pending} label={t('work.create.reconcile')} onPress={() => void reconcile()} testID="work-create-reconcile" /> : <AppButton disabled={pending} label={t(pending ? 'work.create.submitting' : 'work.create.submit')} onPress={() => void submitForm()} testID="work-create-submit" />}
    <AppButton disabled={pending} label={t('work.create.cancel')} onPress={cancel} testID="work-create-cancel" />
  </ScrollView></Screen>;
}
