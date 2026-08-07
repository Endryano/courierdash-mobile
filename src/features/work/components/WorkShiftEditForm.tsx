import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';

import { editableWorkPlatformKeys, type EditableWorkPlatformKey } from '../domain/workShiftEditable';
import type { WorkShiftEditInput } from '../domain/workShiftEdit';
import { useWorkShiftEdit } from '../hooks/useWorkShiftEdit';
import { WorkShiftDateField } from './WorkShiftDateField';
import { WorkFormActions } from './WorkFormActions';
import { WorkFormField } from './WorkFormField';
import { WorkFormFieldPair } from './WorkFormFieldPair';
import { WorkShiftFormSection } from './WorkShiftFormSection';
import { WorkShiftFormShell } from './WorkShiftFormShell';
import { getWorkPlatformAccent, WorkShiftPlatformFieldsCard } from './WorkShiftPlatformFieldsCard';
import { WorkShiftPlatformSelector } from './WorkShiftPlatformSelector';

type Props = { onCancel: () => void };

const metrics = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;
const optionalMetrics = ['appTips', 'cashTips', 'bonuses'] as const;

const parse = (value: string) => value.trim() === '' ? Number.NaN : Number(value);

function formatEditNumericValue(value: number | null): string {
  return value === null || Number.isNaN(value) ? '' : String(value);
}

export function WorkShiftEditForm({ onCancel }: Props) {
  const edit = useWorkShiftEdit();
  const { t } = useLocalization();
  const [input, setInput] = useState<WorkShiftEditInput | null>(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<EditableWorkPlatformKey>>(() => new Set());
  const initializedDisclosure = useRef(false);
  const pending = edit.status === 'submitting';
  const reconciliation = edit.status === 'reconciliation_required';
  const currentInput = input ?? ('input' in edit ? edit.input : null);

  useEffect(() => {
    if (edit.status === 'success') onCancel();
  }, [edit.status, onCancel]);

  useEffect(() => {
    if (currentInput === null || initializedDisclosure.current) return;
    setExpandedPlatforms(new Set(editableWorkPlatformKeys.filter((platform) => optionalMetrics.some((metric) => {
      const value = currentInput.platforms[platform][metric];
      return value !== null && value !== 0;
    }))));
    initializedDisclosure.current = true;
  }, [currentInput]);

  function returnToWork() {
    edit.reset();
    onCancel();
  }

  if (edit.status === 'loading') {
    return <Screen><AppStateSurface loading><AppText>{t('work.edit.loading')}</AppText></AppStateSurface></Screen>;
  }

  if (edit.status === 'recoverable_error' || edit.status === 'blocked' || edit.status === 'not_found') {
    const messageKey = edit.status === 'blocked' ? 'work.edit.blocked' : edit.status === 'not_found' ? 'work.edit.notFound' : 'work.edit.recoverable';
    return <Screen><AppStateSurface action={{ label: t('work.edit.cancel'), onPress: returnToWork }} title={t(messageKey)} /></Screen>;
  }

  if (currentInput === null) return null;

  const update = (platform: EditableWorkPlatformKey, patch: Partial<WorkShiftEditInput['platforms'][EditableWorkPlatformKey]>) => {
    setInput((current) => {
      const base = current ?? currentInput;
      return { ...base, platforms: { ...base.platforms, [platform]: { ...base.platforms[platform], ...patch } } };
    });
  };
  const statusKey = edit.status === 'validation_error' ? 'work.edit.validation' : edit.status === 'duplicate_date' ? 'work.edit.duplicate' : reconciliation ? 'work.edit.reconciliation' : null;
  const selectedPlatforms = new Set(editableWorkPlatformKeys.filter((platform) => currentInput.platforms[platform].enabled));
  const togglePlatformDetails = (platform: EditableWorkPlatformKey) => {
    setExpandedPlatforms((current) => {
      const next = new Set(current);
      if (next.has(platform)) next.delete(platform); else next.add(platform);
      return next;
    });
  };

  return (
    <WorkShiftFormShell
      actions={(
        <WorkFormActions cancelLabel={t('work.edit.cancel')} onCancel={returnToWork} onPrimary={() => void (reconciliation ? edit.reconcile() : edit.submit(currentInput))} pending={pending} primaryLabel={t(reconciliation ? 'work.edit.reconcile' : pending ? 'work.edit.saving' : 'work.edit.save')} primaryTestID={reconciliation ? 'work-edit-reconcile' : 'work-edit-submit'} primaryTone="update" testID="work-edit" />
      )}
      message={statusKey ? <AppText accessibilityRole="alert">{t(statusKey)}</AppText> : undefined}
      testID="work-edit-form"
      title={t('work.edit.title')}
    >
      <WorkShiftFormSection testID="work-edit-general" title={t('work.form.details')}>
        <WorkShiftDateField label={t('work.create.date')} value={currentInput.date} onChange={(date) => setInput((current) => ({ ...(current ?? currentInput), date }))} testID="work-edit-date" />
        <WorkFormFieldPair testID="work-edit-details-pair">
          <WorkFormField label={t('work.create.km')} value={formatEditNumericValue(currentInput.km)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...(current ?? currentInput), km: parse(value) }))} testID="work-edit-km" />
          <WorkFormField label={t('work.create.hours')} value={formatEditNumericValue(currentInput.hours)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...(current ?? currentInput), hours: parse(value) }))} testID="work-edit-hours" />
        </WorkFormFieldPair>
      </WorkShiftFormSection>
      <WorkShiftFormSection testID="work-edit-platforms" title={t('work.form.income')}>
        <WorkShiftPlatformSelector
          disabled={pending}
          getLabel={(platform) => t(`work.platform.${platform}`)}
          getTestID={(platform) => `work-edit-platform-${platform}`}
          onToggle={(platform) => update(platform, { enabled: !currentInput.platforms[platform].enabled })}
          platforms={editableWorkPlatformKeys}
          selected={selectedPlatforms}
          testID="work-edit-platform-selector"
        />
        {editableWorkPlatformKeys.map((platform) => {
        const value = currentInput.platforms[platform];
        if (!value.enabled) return null;

        return (
          <WorkShiftPlatformFieldsCard
            accentColor={getWorkPlatformAccent(platform)}
            detailsExpanded={expandedPlatforms.has(platform)}
            detailsLabel={t(expandedPlatforms.has(platform) ? 'work.form.hideOptional' : 'work.form.showOptional')}
            key={platform}
            onRemove={() => update(platform, { enabled: false })}
            onToggleDetails={() => togglePlatformDetails(platform)}
            removeAccessibilityLabel={`${t('work.form.removePlatform')}: ${t(`work.platform.${platform}`)}`}
            testID={`work-edit-platform-card-${platform}`}
            title={t(`work.platform.${platform}`)}
          >
            {platform === 'other' ? <WorkFormField label={t('work.create.otherName')} value={currentInput.platforms.other.name ?? ''} onChangeText={(name) => update('other', { name })} testID="work-edit-other-name" /> : null}
            <WorkFormFieldPair testID={`work-edit-${platform}-primary-pair`}>
              {metrics.slice(0, 2).map((metric) => <WorkFormField key={metric} label={t(`work.metric.${metric}`)} value={formatEditNumericValue(value[metric])} keyboardType="decimal-pad" onChangeText={(text) => update(platform, { [metric]: parse(text) })} testID={`work-edit-${platform}-${metric}`} />)}
            </WorkFormFieldPair>
            {expandedPlatforms.has(platform) ? <View style={{ gap: 8 }}>
              <WorkFormFieldPair testID={`work-edit-${platform}-optional-pair`}>
                {optionalMetrics.slice(0, 2).map((metric) => <WorkFormField key={metric} label={t(`work.metric.${metric}`)} value={formatEditNumericValue(value[metric])} keyboardType="decimal-pad" onChangeText={(text) => update(platform, { [metric]: parse(text) })} testID={`work-edit-${platform}-${metric}`} />)}
              </WorkFormFieldPair>
              <WorkFormField label={t(`work.metric.${optionalMetrics[2]}`)} value={formatEditNumericValue(value[optionalMetrics[2]])} keyboardType="decimal-pad" onChangeText={(text) => update(platform, { [optionalMetrics[2]]: parse(text) })} testID={`work-edit-${platform}-${optionalMetrics[2]}`} />
            </View> : null}
          </WorkShiftPlatformFieldsCard>
        );
        })}
      </WorkShiftFormSection>
    </WorkShiftFormShell>
  );
}
