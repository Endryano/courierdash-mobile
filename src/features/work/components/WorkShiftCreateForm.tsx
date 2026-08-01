import { useEffect, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';

import { workPlatformKeys, type WorkPlatformKey } from '../domain/workShiftCreate';
import { createEmptyWorkShiftCreateDraft, validateWorkShiftCreateDraft, type WorkShiftCreateDraft } from '../domain/workShiftCreateDraft';
import type { WorkShiftValidationError } from '../domain/workShiftValidation';
import { useWorkShiftCreate } from '../hooks/useWorkShiftCreate';
import { WorkShiftDateField } from './WorkShiftDateField';
import { WorkShiftFormSection } from './WorkShiftFormSection';
import { WorkShiftFormShell } from './WorkShiftFormShell';
import { WorkShiftPlatformFieldsCard } from './WorkShiftPlatformFieldsCard';
import { WorkShiftPlatformSelector } from './WorkShiftPlatformSelector';

type Props = { onCancel: () => void };
const metricKeys = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;

export function WorkShiftCreateForm({ onCancel }: Props) {
  const create = useWorkShiftCreate();
  const { submit, reconcile, reset, status } = create;
  const { t } = useLocalization();
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
  const selectedPlatforms = new Set(workPlatformKeys.filter((platform) => input.platforms[platform].enabled));

  return (
    <WorkShiftFormShell
      actions={(
        <>
          {requiresReconciliation ? <AppButton disabled={pending} label={t('work.create.reconcile')} onPress={() => void reconcile()} testID="work-create-reconcile" /> : <AppButton disabled={pending} label={t(pending ? 'work.create.submitting' : 'work.create.submit')} onPress={() => void submitForm()} testID="work-create-submit" />}
          <AppButton disabled={pending} label={t('work.create.cancel')} onPress={cancel} testID="work-create-cancel" variant="secondary" />
        </>
      )}
      message={statusKey || validationDetailKey ? <><AppText accessibilityRole="alert">{statusKey ? t(statusKey) : null}</AppText>{validationDetailKey ? <AppText accessibilityRole="alert">{t(validationDetailKey)}</AppText> : null}</> : undefined}
      testID="work-create-form"
      title={t('work.create.title')}
    >
      <WorkShiftFormSection testID="work-create-general" title={t('work.form.general')}>
        <WorkShiftDateField label={t('work.create.date')} value={input.date} onChange={(date) => { setFormError(null); setInput((current) => ({ ...current, date })); }} testID="work-create-date" />
        <AppInput label={t('work.create.hours')} value={input.hours} keyboardType="decimal-pad" onChangeText={(hours) => { setFormError(null); setInput((current) => ({ ...current, hours })); }} testID="work-create-hours" />
        <AppInput label={t('work.create.km')} value={input.km} keyboardType="decimal-pad" onChangeText={(km) => { setFormError(null); setInput((current) => ({ ...current, km })); }} testID="work-create-km" />
      </WorkShiftFormSection>
      <WorkShiftFormSection testID="work-create-platforms" title={t('work.form.platforms')}>
        <WorkShiftPlatformSelector
          getLabel={(platform) => t(`work.platform.${platform}`)}
          getTestID={(platform) => `work-platform-${platform}`}
          onToggle={(platform) => updatePlatform(platform, { enabled: !input.platforms[platform].enabled })}
          platforms={workPlatformKeys}
          selected={selectedPlatforms}
          testID="work-create-platform-selector"
        />
      </WorkShiftFormSection>
      {workPlatformKeys.map((platform) => {
        const value = input.platforms[platform];
        if (!value.enabled) return null;

        return (
          <WorkShiftPlatformFieldsCard key={platform} testID={`work-create-platform-card-${platform}`} title={t(`work.platform.${platform}`)}>
            {platform === 'other' ? <AppInput label={t('work.create.otherName')} value={input.platforms.other.name} onChangeText={(name) => updatePlatform('other', { name })} testID="work-other-name" /> : null}
            {metricKeys.map((metric) => <AppInput key={metric} label={t(`work.metric.${metric}`)} value={value[metric]} keyboardType="decimal-pad" onChangeText={(text) => updatePlatform(platform, { [metric]: text })} testID={`work-${platform}-${metric}`} />)}
          </WorkShiftPlatformFieldsCard>
        );
      })}
    </WorkShiftFormShell>
  );
}
