import { BackHandler, ScrollView, View } from 'react-native';
import { useEffect, useRef } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { useWorkShiftDelete } from '../hooks/useWorkShiftDelete';
import { WorkShiftDeleteSummary } from './WorkShiftDeleteSummary';

export function WorkShiftDeleteConfirmation() {
  const deletion = useWorkShiftDelete();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const deletionRef = useRef(deletion);

  useEffect(() => {
    deletionRef.current = deletion;
  }, [deletion]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = deletionRef.current;

      if (current.status === 'deleting') return true;

      if (current.status === 'confirming') {
        current.cancelDelete();
        return true;
      }

      if (current.status === 'recoverable_error' || current.status === 'blocked' || current.status === 'reconciliation_required') {
        current.reset();
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, []);

  if (deletion.status === 'idle') return null;

  const isConfirming = deletion.status === 'confirming';
  const isDeleting = deletion.status === 'deleting';
  const isReconciling = deletion.status === 'reconciliation_required';
  const titleKey = isConfirming || isDeleting
    ? 'work.delete.title'
    : deletion.status === 'recoverable_error'
      ? 'work.delete.recoverableTitle'
      : deletion.status === 'blocked'
        ? 'work.delete.blockedTitle'
        : 'work.delete.reconciliationTitle';
  const messageKey = isConfirming
    ? 'work.delete.body'
    : deletion.status === 'recoverable_error'
      ? 'work.delete.recoverable'
      : deletion.status === 'blocked'
        ? 'work.delete.blocked'
        : isReconciling
          ? 'work.delete.reconciliation'
          : 'work.delete.deleting';
  const returnLabel = t('work.delete.return');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}>
        <AppCard padding="lg" style={{ gap: spacing.lg }} testID="work-delete-confirmation-card">
          <View style={{ gap: spacing.sm }}>
            <AppText accessibilityRole="header" variant="title">{t(titleKey)}</AppText>
            <AppText accessibilityRole="alert">{t(messageKey)}</AppText>
          </View>
          <WorkShiftDeleteSummary summary={deletion.summary} />
          <View style={{ gap: spacing.sm }}>
            {isReconciling ? (
              <AppButton accessibilityLabel={t('work.delete.reconcile')} label={t('work.delete.reconcile')} onPress={() => void deletion.reconcile()} testID="work-delete-reconcile" />
            ) : null}
            {isConfirming || isDeleting ? (
              <AppButton accessibilityLabel={t(isDeleting ? 'work.delete.deleting' : 'work.delete.confirm')} disabled={isDeleting} label={t(isDeleting ? 'work.delete.deleting' : 'work.delete.confirm')} loading={isDeleting} onPress={() => void deletion.confirmDelete()} testID="work-delete-confirm" variant="danger" />
            ) : null}
            <AppButton accessibilityLabel={isConfirming || isDeleting ? t('work.delete.cancel') : returnLabel} disabled={isDeleting} label={isConfirming || isDeleting ? t('work.delete.cancel') : returnLabel} onPress={() => isConfirming ? deletion.cancelDelete() : deletion.reset()} testID="work-delete-cancel" variant={isConfirming || isDeleting ? 'ghost' : 'secondary'} />
          </View>
        </AppCard>
      </ScrollView>
    </Screen>
  );
}
