import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { useWorkShifts } from '../hooks/useWorkShifts';
import { WorkShiftCreateForm } from './WorkShiftCreateForm';
import { WorkShiftEditForm } from './WorkShiftEditForm';
import { useWorkShiftEdit } from '../hooks/useWorkShiftEdit';

export function WorkShiftsPlaceholder() {
  const { retry, shifts, status } = useWorkShifts();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const edit = useWorkShiftEdit();

  async function retryWorkShifts() {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      await retry();
    } catch {
      // The read provider already exposes the safe error state.
    } finally {
      setIsRetrying(false);
    }
  }

  if (isCreating) return <WorkShiftCreateForm onCancel={() => setIsCreating(false)} />;
  if (isEditing) return <WorkShiftEditForm onCancel={() => setIsEditing(false)} />;

  if (status === 'loading' || status === 'idle') {
    return <Screen><View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}><AppText>{t('work.loading')}</AppText></View></Screen>;
  }

  if (status === 'recoverable_error' || status === 'blocked') {
    const blocked = status === 'blocked';
    return (
      <Screen><View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <AppText variant="title">{t(blocked ? 'work.blocked.title' : 'work.error.title')}</AppText>
        <AppText muted>{t(blocked ? 'work.blocked.description' : 'work.error.description')}</AppText>
        <AppButton disabled={isRetrying} label={t('work.retry')} onPress={() => void retryWorkShifts()} testID="work-retry" />
      </View></Screen>
    );
  }

  if (status === 'empty') {
    return <Screen><View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}><AppText variant="title">{t('work.empty.title')}</AppText><AppText muted>{t('work.empty.description')}</AppText><AppButton label={t('work.create.action')} onPress={() => setIsCreating(true)} testID="work-create-action" /></View></Screen>;
  }

  return (
    <Screen><View style={{ flex: 1, padding: spacing.xl, gap: spacing.md }}>
      <AppText variant="title">{t('work.list.title')}</AppText>
      <AppButton label={t('work.create.action')} onPress={() => setIsCreating(true)} testID="work-create-action" />
      {shifts.map((shift) => (
        <View key={shift.id} style={{ gap: spacing.xs }}>
          <AppText>{shift.date}</AppText>
          <AppText muted>{`${t('work.shift.hours')}: ${shift.hours}`}</AppText>
          <AppText muted>{`${t('work.shift.km')}: ${shift.km}`}</AppText>
          <AppButton label={t('work.edit.action')} onPress={() => { setIsEditing(true); void edit.load(shift.id); }} testID={`work-edit-${shift.id}`} />
        </View>
      ))}
    </View></Screen>
  );
}
