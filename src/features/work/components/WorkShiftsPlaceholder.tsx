import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { useWorkShifts } from '../hooks/useWorkShifts';
import { useWorkShiftDelete } from '../hooks/useWorkShiftDelete';
import { WorkShiftDeleteConfirmation } from './WorkShiftDeleteConfirmation';
import { WorkShiftListItem } from './WorkShiftListItem';

export function WorkShiftsPlaceholder() {
  const { retry, shifts, status } = useWorkShifts();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const deletion = useWorkShiftDelete();

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

  if (deletion.status !== 'idle') return <WorkShiftDeleteConfirmation />;

  if (status === 'loading' || status === 'idle') {
    return <Screen><AppStateSurface loading><AppText>{t('work.loading')}</AppText></AppStateSurface></Screen>;
  }

  if (status === 'recoverable_error' || status === 'blocked') {
    const blocked = status === 'blocked';
    return (
      <Screen><AppStateSurface action={{ disabled: isRetrying, label: t('work.retry'), onPress: () => void retryWorkShifts(), testID: 'work-retry' }} description={t(blocked ? 'work.blocked.description' : 'work.error.description')} title={t(blocked ? 'work.blocked.title' : 'work.error.title')} /></Screen>
    );
  }

  if (status === 'empty') {
    return <Screen><AppStateSurface action={{ label: t('work.create.action'), onPress: () => router.push('/work/create'), testID: 'work-create-action' }} description={t('work.empty.description')} title={t('work.empty.title')} /></Screen>;
  }

  return (
    <Screen>
      <FlatList
        contentContainerStyle={[styles.listContent, { gap: spacing.md, padding: spacing.xl, paddingBottom: spacing.xxl + 64 }]}
        data={shifts}
        keyExtractor={(shift) => String(shift.id)}
        ListHeaderComponent={(
          <View style={{ gap: spacing.md }}>
            <AppText variant="title">{t('work.list.title')}</AppText>
            <AppButton label={t('work.create.action')} onPress={() => router.push('/work/create')} testID="work-create-action" />
          </View>
        )}
        renderItem={({ item }) => (
          <WorkShiftListItem
            onDelete={(shift) => deletion.requestDelete(shift)}
            onEdit={(shiftId) => router.push(`/work/${shiftId}/edit`)}
            shift={item}
          />
        )}
        testID="work-shifts-list"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
});
