import type { WorkShift } from './workShift';
import { calculateWorkShiftBrutto } from './workShiftAnalytics';

export const workShiftHistorySortModes = [
  'date_desc',
  'date_asc',
  'income_desc',
  'income_asc',
  'distance_desc',
  'distance_asc',
] as const;

export type WorkShiftHistorySortMode = (typeof workShiftHistorySortModes)[number];

function compareNewestFirst(left: WorkShift, right: WorkShift): number {
  return right.date.localeCompare(left.date);
}

function compareNumbers(left: number, right: number, direction: 'asc' | 'desc'): number {
  const leftAvailable = Number.isFinite(left);
  const rightAvailable = Number.isFinite(right);

  if (!leftAvailable && !rightAvailable) return 0;
  if (!leftAvailable) return 1;
  if (!rightAvailable) return -1;

  return direction === 'asc' ? left - right : right - left;
}

export function sortWorkShiftHistory(shifts: readonly WorkShift[], mode: WorkShiftHistorySortMode): WorkShift[] {
  return shifts
    .map((shift, index) => ({ index, shift }))
    .sort((left, right) => {
      if (mode === 'date_desc') return compareNewestFirst(left.shift, right.shift) || left.index - right.index;
      if (mode === 'date_asc') return left.shift.date.localeCompare(right.shift.date) || left.index - right.index;

      const primary = mode === 'income_desc' || mode === 'income_asc'
        ? compareNumbers(calculateWorkShiftBrutto(left.shift), calculateWorkShiftBrutto(right.shift), mode === 'income_desc' ? 'desc' : 'asc')
        : compareNumbers(left.shift.km, right.shift.km, mode === 'distance_desc' ? 'desc' : 'asc');

      return primary || compareNewestFirst(left.shift, right.shift) || left.index - right.index;
    })
    .map(({ shift }) => shift);
}
