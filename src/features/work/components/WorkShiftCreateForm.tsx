import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { workPlatformKeys, type WorkPlatformKey } from '../domain/workShiftCreate';
import { createEmptyWorkShiftCreateDraft, validateWorkShiftCreateDraft, type WorkShiftCreateDraft } from '../domain/workShiftCreateDraft';
import type { WorkShiftValidationError } from '../domain/workShiftValidation';
import { useWorkShiftCreate } from '../hooks/useWorkShiftCreate';
import { WorkShiftDateField } from './WorkShiftDateField';
import { WorkFormActions } from './WorkFormActions';
import { WorkFormField } from './WorkFormField';
import { WorkShiftFormSection } from './WorkShiftFormSection';
import { WorkShiftFormShell } from './WorkShiftFormShell';
import { getWorkPlatformAccent, WorkShiftPlatformFieldsCard } from './WorkShiftPlatformFieldsCard';
import { WorkShiftPlatformSelector } from './WorkShiftPlatformSelector';

type Props = { onCancel: () => void };
const metricKeys = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;
const optionalMetricKeys = ['appTips', 'cashTips', 'bonuses'] as const;

export function WorkShiftCreateForm({ onCancel }: Props) {
  const create = useWorkShiftCreate();
  const { submit, reconcile, reset, status } = create;
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [input, setInput] = useState<WorkShiftCreateDraft>(createEmptyWorkShiftCreateDraft);
  const [formError, setFormError] = useState<WorkShiftValidationError | null>(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<WorkPlatformKey>>(() => new Set());
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
  function togglePlatformDetails(platform: WorkPlatformKey) {
    setExpandedPlatforms((current) => {
      const next = new Set(current);
      if (next.has(platform)) next.delete(platform); else next.add(platform);
      return next;
    });
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
        <WorkFormActions cancelLabel={t('work.create.cancel')} onCancel={cancel} onPrimary={() => void (requiresReconciliation ? reconcile() : submitForm())} pending={pending} primaryLabel={t(requiresReconciliation ? 'work.create.reconcile' : pending ? 'work.create.submitting' : 'work.create.submit')} primaryTestID={requiresReconciliation ? 'work-create-reconcile' : 'work-create-submit'} primaryTone="create" testID="work-create" />
      )}
      message={statusKey || validationDetailKey ? <><AppText accessibilityRole="alert">{statusKey ? t(statusKey) : null}</AppText>{validationDetailKey ? <AppText accessibilityRole="alert">{t(validationDetailKey)}</AppText> : null}</> : undefined}
      testID="work-create-form"
      title={t('work.create.title')}
    >
      <WorkShiftFormSection testID="work-create-general" title={t('work.form.details')}>
        <WorkShiftDateField error={validationError === 'invalid_date' ? t('work.create.validation.date') : undefined} label={t('work.create.date')} value={input.date} onChange={(date) => { setFormError(null); setInput((current) => ({ ...current, date })); }} testID="work-create-date" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <View style={{ flexGrow: 1, minWidth: 150 }}><WorkFormField label={t('work.create.km')} value={input.km} keyboardType="decimal-pad" onChangeText={(km) => { setFormError(null); setInput((current) => ({ ...current, km })); }} testID="work-create-km" /></View>
          <View style={{ flexGrow: 1, minWidth: 150 }}><WorkFormField label={t('work.create.hours')} value={input.hours} keyboardType="decimal-pad" onChangeText={(hours) => { setFormError(null); setInput((current) => ({ ...current, hours })); }} testID="work-create-hours" /></View>
        </View>
      </WorkShiftFormSection>
      <WorkShiftFormSection testID="work-create-platforms" title={t('work.form.income')}>
        <WorkShiftPlatformSelector
          disabled={pending}
          getLabel={(platform) => t(`work.platform.${platform}`)}
          getTestID={(platform) => `work-platform-${platform}`}
          onToggle={(platform) => updatePlatform(platform, { enabled: !input.platforms[platform].enabled })}
          platforms={workPlatformKeys}
          selected={selectedPlatforms}
          testID="work-create-platform-selector"
        />
        {workPlatformKeys.map((platform) => {
        const value = input.platforms[platform];
        if (!value.enabled) return null;

        return (
          <WorkShiftPlatformFieldsCard
            accentColor={getWorkPlatformAccent(platform)}
            detailsExpanded={expandedPlatforms.has(platform)}
            detailsLabel={t(expandedPlatforms.has(platform) ? 'work.form.hideOptional' : 'work.form.showOptional')}
            key={platform}
            onRemove={() => updatePlatform(platform, { enabled: false })}
            onToggleDetails={() => togglePlatformDetails(platform)}
            removeAccessibilityLabel={`${t('work.form.removePlatform')}: ${t(`work.platform.${platform}`)}`}
            testID={`work-create-platform-card-${platform}`}
            title={t(`work.platform.${platform}`)}
          >
            {platform === 'other' ? <WorkFormField label={t('work.create.otherName')} value={input.platforms.other.name} onChangeText={(name) => updatePlatform('other', { name })} testID="work-other-name" /> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {metricKeys.slice(0, 2).map((metric) => <View key={metric} style={{ flexGrow: 1, minWidth: 132 }}><WorkFormField label={t(`work.metric.${metric}`)} value={value[metric]} keyboardType="decimal-pad" onChangeText={(text) => updatePlatform(platform, { [metric]: text })} testID={`work-${platform}-${metric}`} /></View>)}
            </View>
            {expandedPlatforms.has(platform) ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {optionalMetricKeys.map((metric) => <View key={metric} style={{ flexGrow: 1, minWidth: 132 }}><WorkFormField label={t(`work.metric.${metric}`)} value={value[metric]} keyboardType="decimal-pad" onChangeText={(text) => updatePlatform(platform, { [metric]: text })} testID={`work-${platform}-${metric}`} /></View>)}
            </View> : null}
          </WorkShiftPlatformFieldsCard>
        );
        })}
      </WorkShiftFormSection>
    </WorkShiftFormShell>
  );
}
