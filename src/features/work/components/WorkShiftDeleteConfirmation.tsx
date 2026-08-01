import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { useWorkShiftDelete } from '../hooks/useWorkShiftDelete';

export function WorkShiftDeleteConfirmation() {
  const deletion = useWorkShiftDelete();
  const { t } = useLocalization();
  const { spacing } = useTheme();

  if (deletion.status === 'idle') return null;

  const isConfirming = deletion.status === 'confirming';
  const isDeleting = deletion.status === 'deleting';
  const isReconciling = deletion.status === 'reconciliation_required';
  const message = isConfirming
    ? 'work.delete.body'
    : deletion.status === 'recoverable_error'
      ? 'work.delete.recoverable'
      : deletion.status === 'blocked'
        ? 'work.delete.blocked'
        : isReconciling
          ? 'work.delete.reconciliation'
          : 'work.delete.deleting';

  return <Screen><View style={{ padding: spacing.xl, gap: spacing.md }}>
    <AppText variant="title">{t('work.delete.title')}</AppText>
    <AppText accessibilityRole="alert">{t(message)}</AppText>
    {isReconciling ? <AppButton label={t('work.delete.reconcile')} onPress={() => void deletion.reconcile()} testID="work-delete-reconcile" /> : null}
    {isConfirming || isDeleting ? <AppButton disabled={isDeleting} label={t(isDeleting ? 'work.delete.deleting' : 'work.delete.confirm')} onPress={() => void deletion.confirmDelete()} testID="work-delete-confirm" /> : null}
    <AppButton disabled={isDeleting} label={t('work.delete.cancel')} onPress={() => isConfirming ? deletion.cancelDelete() : deletion.reset()} testID="work-delete-cancel" />
  </View></Screen>;
}
