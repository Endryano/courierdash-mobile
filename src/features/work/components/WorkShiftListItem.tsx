import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useTheme } from '@/theme/ThemeProvider';

import type { WorkShift, WorkShiftSummary } from '../domain/workShift';
import { calculatePlatformBrutto, calculatePlatformOrders, calculateWorkShiftBrutto, workPlatformKeys } from '../domain/workShiftAnalytics';
import { formatWorkShiftHistoryDate } from '../domain/workShiftDate';

type WorkShiftListItemProps = {
  readonly shift: WorkShift;
  readonly onEdit: (shiftId: number) => void;
  readonly onDelete: (shift: WorkShiftSummary) => void;
};

export function WorkShiftListItem({ onDelete, onEdit, shift }: WorkShiftListItemProps) {
  const { locale, t } = useLocalization();
  const { colors, spacing } = useTheme();
  const date = formatWorkShiftHistoryDate(shift.date, locale) ?? t('work.date.invalid');
  const hours = formatNumber(locale, shift.hours, 2);
  const kilometres = formatNumber(locale, shift.km, 2);
  const platforms = workPlatformKeys
    .filter((key) => calculatePlatformBrutto(shift.analytics.platforms[key]) > 0 || calculatePlatformOrders(shift.analytics.platforms[key]) > 0)
    .map((key) => key === 'other' ? shift.analytics.platforms.other.name || t('work.platform.other') : t(`work.platform.${key}`));
  const brutto = calculateWorkShiftBrutto(shift);
  const orders = workPlatformKeys.reduce((total, key) => total + calculatePlatformOrders(shift.analytics.platforms[key]), 0);
  const incomePerHour = shift.hours > 0 ? brutto / shift.hours : 0;
  const incomePerKilometre = shift.km > 0 ? brutto / shift.km : 0;
  const incomePerOrder = orders > 0 ? brutto / orders : 0;

  return (
    <AppCard padding="md" style={[styles.card, { gap: spacing.sm }]} testID={`work-shift-${shift.id}`}>
      <View style={styles.topRow}>
        <AppText accessibilityLabel={`${t('work.create.date')}: ${date}`} style={styles.date} variant="body">{date}</AppText>
        <AppText style={[styles.brutto, { color: colors.positive }]} variant="title">{formatCurrency(locale, brutto)}</AppText>
      </View>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <AppText muted style={styles.platforms} variant="label">{`${t('work.history.platforms')}: ${platforms.join(' • ') || '—'}`}</AppText>
      <View style={[styles.detailsRow, { gap: spacing.sm }]}>
        <View style={[styles.detailPanel, { borderColor: colors.border }]}>
          <AppText muted style={styles.panelTitle} variant="label">{t('work.history.shiftData')}</AppText>
          <AppText adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.panelIncome, { color: colors.positive }]} variant="body">{formatCurrency(locale, brutto)}</AppText>
          <View style={[styles.innerSeparator, { backgroundColor: colors.border }]} />
          <MetricRow color="#579aff" label={t('work.history.orders')} value={formatNumber(locale, orders, 0)} />
          <MetricRow label={t('work.history.hours')} value={hours} />
          <MetricRow label={t('work.history.kilometers')} value={kilometres} />
        </View>
        <View style={[styles.detailPanel, { borderColor: colors.border }]}>
          <AppText muted style={[styles.panelTitle, styles.panelTitleCentered]} variant="label">{t('work.history.efficiency')}</AppText>
          <MetricRow color="#00c9e9" label={t('work.history.incomePerHour')} value={formatCurrency(locale, incomePerHour)} />
          <View style={[styles.innerSeparator, { backgroundColor: colors.border }]} />
          <MetricRow color="#b66cff" label={t('work.history.incomePerKilometer')} value={formatCurrency(locale, incomePerKilometre)} />
          <View style={[styles.innerSeparator, { backgroundColor: colors.border }]} />
          <MetricRow color="#f0bf00" label={t('work.history.incomePerOrder')} value={formatCurrency(locale, incomePerOrder)} />
        </View>
      </View>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable accessibilityLabel={t('work.edit.action')} accessibilityRole="button" onPress={() => onEdit(shift.id)} style={({ pressed }) => [styles.editAction, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} testID={`work-edit-${shift.id}`}>
          <AppText style={[styles.editText, { color: colors.warning }]} variant="body">{`✎ ${t('work.edit.action')}`}</AppText>
        </Pressable>
        <Pressable accessibilityLabel={t('work.delete.action')} accessibilityRole="button" onPress={() => onDelete(shift)} style={({ pressed }) => [styles.deleteAction, { borderColor: '#4b252d', opacity: pressed ? 0.8 : 1 }]} testID={`work-delete-${shift.id}`}>
          <AppText style={styles.deleteText} variant="body">⌫</AppText>
        </Pressable>
      </View>
    </AppCard>
  );
}

function MetricRow({ color, label, value }: { readonly color?: string; readonly label: string; readonly value: string }) {
  return (
    <View style={styles.metricRow}>
      <AppText adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.metricLabel, color === undefined ? undefined : { color }]} variant="body">{label}</AppText>
      <AppText adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.metricValue, color === undefined ? undefined : { color }]} variant="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: '#213248', borderRadius: 22, borderWidth: 1 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  date: { flex: 1, fontSize: 19, fontWeight: '700', lineHeight: 24 },
  brutto: { fontSize: 23, lineHeight: 28, marginLeft: 8 },
  separator: { height: 1 },
  platforms: { fontSize: 14, fontWeight: '500', letterSpacing: 0.3 },
  detailsRow: { flexDirection: 'row' },
  detailPanel: { borderRadius: 16, borderWidth: 1, flex: 1, flexBasis: 0, gap: 6, minWidth: 0, padding: 8 },
  panelTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  panelIncome: { fontSize: 17, fontWeight: '700', lineHeight: 22, minWidth: 0, textAlign: 'right' },
  panelTitleCentered: { textAlign: 'center' },
  innerSeparator: { height: 1 },
  metricRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'nowrap', minWidth: 0 },
  metricLabel: { color: '#a8b0c1', flex: 1, flexShrink: 1, fontSize: 13, lineHeight: 19, minWidth: 0 },
  metricValue: { flexShrink: 1, fontSize: 15, fontWeight: '700', lineHeight: 20, marginLeft: 4, minWidth: 0, textAlign: 'right' },
  editAction: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 },
  editText: { fontWeight: '700' },
  deleteAction: { alignItems: 'center', borderRadius: 16, borderWidth: 1, justifyContent: 'center', minHeight: 48, width: 56 },
  deleteText: { fontSize: 22, lineHeight: 24 },
});
