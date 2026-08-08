import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { useWorkShifts } from '../hooks/useWorkShifts';
import { useWorkShiftDelete } from '../hooks/useWorkShiftDelete';
import { sortWorkShiftHistory, type WorkShiftHistorySortMode } from '../domain/workShiftHistorySort';
import { WorkShiftDeleteConfirmation } from './WorkShiftDeleteConfirmation';
import { WorkShiftListItem } from './WorkShiftListItem';

const sortOptions: readonly { readonly labelKey: 'work.history.sort.incomeDesc' | 'work.history.sort.incomeAsc' | 'work.history.sort.distanceDesc' | 'work.history.sort.distanceAsc' | 'work.history.sort.dateDesc' | 'work.history.sort.dateAsc'; readonly value: WorkShiftHistorySortMode }[] = [
  { labelKey: 'work.history.sort.incomeDesc', value: 'income_desc' },
  { labelKey: 'work.history.sort.incomeAsc', value: 'income_asc' },
  { labelKey: 'work.history.sort.distanceDesc', value: 'distance_desc' },
  { labelKey: 'work.history.sort.distanceAsc', value: 'distance_asc' },
  { labelKey: 'work.history.sort.dateDesc', value: 'date_desc' },
  { labelKey: 'work.history.sort.dateAsc', value: 'date_asc' },
];

const sortLabelKeys: Record<WorkShiftHistorySortMode, (typeof sortOptions)[number]['labelKey']> = {
  date_desc: 'work.history.sort.dateDesc',
  date_asc: 'work.history.sort.dateAsc',
  income_desc: 'work.history.sort.incomeDesc',
  income_asc: 'work.history.sort.incomeAsc',
  distance_desc: 'work.history.sort.distanceDesc',
  distance_asc: 'work.history.sort.distanceAsc',
};

export function WorkShiftsPlaceholder() {
  const { retry, shifts, status } = useWorkShifts();
  const { t } = useLocalization();
  const { colors, spacing } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSortPickerVisible, setIsSortPickerVisible] = useState(false);
  const [sortMode, setSortMode] = useState<WorkShiftHistorySortMode>('date_desc');
  const deletion = useWorkShiftDelete();
  const sortedShifts = useMemo(() => sortWorkShiftHistory(shifts, sortMode), [shifts, sortMode]);

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
        data={sortedShifts}
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
            <Pressable
              accessibilityLabel={`${t('work.history.sort')}: ${t(sortLabelKeys[sortMode])}`}
              accessibilityRole="button"
              onPress={() => setIsSortPickerVisible(true)}
              style={({ pressed }) => [styles.sortControl, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
              testID="work-history-sort-control"
            >
              <AppText muted style={styles.sortControlLabel} variant="label">{t('work.history.sort')}</AppText>
              <AppText style={[styles.sortControlValue, { color: colors.accent }]} variant="label">{t(sortLabelKeys[sortMode])}</AppText>
            </Pressable>
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
      <Modal animationType="fade" onRequestClose={() => setIsSortPickerVisible(false)} transparent visible={isSortPickerVisible}>
        <View style={styles.modalBackdrop}>
          <Pressable accessibilityLabel={t('work.history.sort.close')} accessibilityRole="button" onPress={() => setIsSortPickerVisible(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityLabel={t('work.history.sort')} accessibilityViewIsModal style={[styles.sortModal, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <AppText accessibilityRole="header" style={styles.sortModalTitle} variant="title">{t('work.history.sort')}</AppText>
            {sortOptions.map((option) => {
              const selected = option.value === sortMode;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => {
                    setSortMode(option.value);
                    setIsSortPickerVisible(false);
                  }}
                  style={({ pressed }) => [styles.sortOption, { backgroundColor: selected ? '#17343A' : colors.surface, borderColor: selected ? colors.accent : colors.border, opacity: pressed ? 0.8 : 1 }]}
                  testID={`work-history-sort-${option.value}`}
                >
                  <AppText muted={!selected} style={selected ? { color: colors.accent } : undefined} variant="body">{t(option.labelKey)}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
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
  sortControl: { alignItems: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 12 },
  sortControlLabel: { fontSize: 13, fontWeight: '500' },
  sortControlValue: { flexShrink: 1, fontSize: 13, fontWeight: '600', marginLeft: 12, textAlign: 'right' },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.6)', flex: 1, justifyContent: 'flex-end', padding: 16 },
  sortModal: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 8, padding: 12 },
  sortModalTitle: { fontSize: 20, lineHeight: 26 },
  sortOption: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  createFab: { alignItems: 'center', borderRadius: 32, bottom: 24, height: 64, justifyContent: 'center', position: 'absolute', right: 20, width: 64 },
  createFabIcon: { fontSize: 38, fontWeight: '400', lineHeight: 42 },
});
