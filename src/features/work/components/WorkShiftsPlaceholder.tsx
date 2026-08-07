import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

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
  const { colors, spacing } = useTheme();
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
        contentContainerStyle={[styles.listContent, { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl + 88 }]}
        data={shifts}
        keyExtractor={(shift) => String(shift.id)}
        ListHeaderComponent={(
          <View style={{ gap: spacing.xs }}>
            <View style={styles.historyHeading}>
              <View style={{ gap: spacing.xxs }}>
                <AppText accessibilityRole="header" style={styles.historyTitle} variant="title">{t('work.history.title')}</AppText>
                <AppText muted style={styles.historySubtitle} variant="label">{t('work.history.subtitle')}</AppText>
              </View>
              <View style={[styles.countBadge, { backgroundColor: colors.surfaceElevated }]}>
                <AppText muted variant="label">{`${t('work.history.days')}: ${shifts.length}`}</AppText>
              </View>
            </View>
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
      <Pressable
        accessibilityLabel={t('work.create.action')}
        accessibilityRole="button"
        onPress={() => router.push('/work/create')}
        style={({ pressed }) => [styles.createFab, { backgroundColor: pressed ? colors.positivePressed : colors.positive }]}
        testID="work-create-action"
      >
        <AppText style={styles.createFabIcon} variant="title">+</AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  historyHeading: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  historyTitle: { fontSize: 27, fontWeight: '700', lineHeight: 34 },
  historySubtitle: { fontSize: 15, lineHeight: 21 },
  countBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  createFab: { alignItems: 'center', borderRadius: 32, bottom: 24, height: 64, justifyContent: 'center', position: 'absolute', right: 20, width: 64 },
  createFabIcon: { fontSize: 38, fontWeight: '400', lineHeight: 42 },
});
