import { useEffect, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';

import { editableWorkPlatformKeys, type EditableWorkPlatformKey } from '../domain/workShiftEditable';
import type { WorkShiftEditInput } from '../domain/workShiftEdit';
import { useWorkShiftEdit } from '../hooks/useWorkShiftEdit';
import { WorkShiftDateField } from './WorkShiftDateField';
import { WorkShiftFormSection } from './WorkShiftFormSection';
import { WorkShiftFormShell } from './WorkShiftFormShell';
import { WorkShiftPlatformFieldsCard } from './WorkShiftPlatformFieldsCard';
import { WorkShiftPlatformSelector } from './WorkShiftPlatformSelector';

type Props = { onCancel: () => void };

const metrics = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;

const parse = (value: string) => value.trim() === '' ? Number.NaN : Number(value);

function formatEditNumericValue(value: number | null): string {
  return value === null || Number.isNaN(value) ? '' : String(value);
}

export function WorkShiftEditForm({ onCancel }: Props) {
  const edit = useWorkShiftEdit();
  const { t } = useLocalization();
  const [input, setInput] = useState<WorkShiftEditInput | null>(null);
  const pending = edit.status === 'submitting';
  const reconciliation = edit.status === 'reconciliation_required';

  useEffect(() => {
    if (edit.status === 'success') onCancel();
  }, [edit.status, onCancel]);

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

  const currentInput = input ?? ('input' in edit ? edit.input : null);
  if (currentInput === null) return null;

  const update = (platform: EditableWorkPlatformKey, patch: Partial<WorkShiftEditInput['platforms'][EditableWorkPlatformKey]>) => {
    setInput((current) => {
      const base = current ?? currentInput;
      return { ...base, platforms: { ...base.platforms, [platform]: { ...base.platforms[platform], ...patch } } };
    });
  };
  const statusKey = edit.status === 'validation_error' ? 'work.edit.validation' : edit.status === 'duplicate_date' ? 'work.edit.duplicate' : reconciliation ? 'work.edit.reconciliation' : null;
  const selectedPlatforms = new Set(editableWorkPlatformKeys.filter((platform) => currentInput.platforms[platform].enabled));

  return (
    <WorkShiftFormShell
      actions={(
        <>
          {reconciliation ? <AppButton label={t('work.edit.reconcile')} onPress={() => void edit.reconcile()} testID="work-edit-reconcile" /> : <AppButton disabled={pending} label={t(pending ? 'work.edit.saving' : 'work.edit.save')} onPress={() => void edit.submit(currentInput)} testID="work-edit-submit" />}
          <AppButton disabled={pending} label={t('work.edit.cancel')} onPress={returnToWork} testID="work-edit-cancel" variant="secondary" />
        </>
      )}
      message={statusKey ? <AppText accessibilityRole="alert">{t(statusKey)}</AppText> : undefined}
      testID="work-edit-form"
      title={t('work.edit.title')}
    >
      <WorkShiftFormSection testID="work-edit-general" title={t('work.form.general')}>
        <WorkShiftDateField label={t('work.create.date')} value={currentInput.date} onChange={(date) => setInput((current) => ({ ...(current ?? currentInput), date }))} testID="work-edit-date" />
        <AppInput label={t('work.create.hours')} value={formatEditNumericValue(currentInput.hours)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...(current ?? currentInput), hours: parse(value) }))} testID="work-edit-hours" />
        <AppInput label={t('work.create.km')} value={formatEditNumericValue(currentInput.km)} keyboardType="decimal-pad" onChangeText={(value) => setInput((current) => ({ ...(current ?? currentInput), km: parse(value) }))} testID="work-edit-km" />
      </WorkShiftFormSection>
      <WorkShiftFormSection testID="work-edit-platforms" title={t('work.form.platforms')}>
        <WorkShiftPlatformSelector
          getLabel={(platform) => t(`work.platform.${platform}`)}
          getTestID={(platform) => `work-edit-platform-${platform}`}
          onToggle={(platform) => update(platform, { enabled: !currentInput.platforms[platform].enabled })}
          platforms={editableWorkPlatformKeys}
          selected={selectedPlatforms}
          testID="work-edit-platform-selector"
        />
      </WorkShiftFormSection>
      {editableWorkPlatformKeys.map((platform) => {
        const value = currentInput.platforms[platform];
        if (!value.enabled) return null;

        return (
          <WorkShiftPlatformFieldsCard key={platform} testID={`work-edit-platform-card-${platform}`} title={t(`work.platform.${platform}`)}>
            {platform === 'other' ? <AppInput label={t('work.create.otherName')} value={currentInput.platforms.other.name ?? ''} onChangeText={(name) => update('other', { name })} testID="work-edit-other-name" /> : null}
            {metrics.map((metric) => <AppInput key={metric} label={t(`work.metric.${metric}`)} value={formatEditNumericValue(value[metric])} keyboardType="decimal-pad" onChangeText={(text) => update(platform, { [metric]: parse(text) })} testID={`work-edit-${platform}-${metric}`} />)}
          </WorkShiftPlatformFieldsCard>
        );
      })}
    </WorkShiftFormShell>
  );
}
