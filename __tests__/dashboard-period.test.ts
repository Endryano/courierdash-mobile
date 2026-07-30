import { describe, expect, test } from '@jest/globals';

import { filterWorkShiftsByPeriod } from '@/features/work/domain/workShiftPeriod';
import { filterWorkShiftsByPeriod as dashboardFilterWorkShiftsByPeriod } from '@/features/dashboard/domain/dashboardPeriod';
import type { WorkShift } from '@/features/work/domain/workShift';

function shift(id: number, date: string): WorkShift {
  return { id, date, hours: 0, km: 0, analytics: { platforms: {
    uber: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
  } } };
}

const july29 = new Date(2026, 6, 29, 12, 0, 0);

describe('filterWorkShiftsByPeriod', () => {
  test('is the same canonical implementation exposed to Dashboard', () => {
    expect(dashboardFilterWorkShiftsByPeriod).toBe(filterWorkShiftsByPeriod);
  });

  test('matches only the local calendar Today and keeps multiple same-day shifts', () => {
    const shifts = [shift(1, '2026-07-28'), shift(2, '2026-07-29'), shift(3, '2026-07-29'), shift(4, '2026-07-30')];
    expect(filterWorkShiftsByPeriod(shifts, 'today', july29).map(({ id }) => id)).toEqual([2, 3]);
  });

  test('uses Monday through Sunday boundaries across months', () => {
    const now = new Date(2026, 7, 2, 12, 0, 0);
    const shifts = [shift(1, '2026-07-26'), shift(2, '2026-07-27'), shift(3, '2026-08-02'), shift(4, '2026-08-03')];
    expect(filterWorkShiftsByPeriod(shifts, 'week', now).map(({ id }) => id)).toEqual([2, 3]);
  });

  test('uses Monday through Sunday boundaries across years', () => {
    const now = new Date(2027, 0, 1, 12, 0, 0);
    const shifts = [shift(1, '2026-12-27'), shift(2, '2026-12-28'), shift(3, '2027-01-03'), shift(4, '2027-01-04')];
    expect(filterWorkShiftsByPeriod(shifts, 'week', now).map(({ id }) => id)).toEqual([2, 3]);
  });

  test('includes only the current calendar month including both boundaries', () => {
    const shifts = [shift(1, '2026-06-30'), shift(2, '2026-07-01'), shift(3, '2026-07-31'), shift(4, '2026-08-01')];
    expect(filterWorkShiftsByPeriod(shifts, 'month', july29).map(({ id }) => id)).toEqual([2, 3]);
  });

  test('handles the December to January month boundary', () => {
    const january = new Date(2027, 0, 15, 12, 0, 0);
    const shifts = [shift(1, '2026-12-31'), shift(2, '2027-01-01'), shift(3, '2027-01-31'), shift(4, '2027-02-01')];
    expect(filterWorkShiftsByPeriod(shifts, 'month', january).map(({ id }) => id)).toEqual([2, 3]);
  });

  test('handles February in a leap year using local calendar boundaries', () => {
    const february = new Date(2028, 1, 29, 12, 0, 0);
    const shifts = [shift(1, '2028-02-28'), shift(2, '2028-02-29'), shift(3, '2028-03-01')];
    expect(filterWorkShiftsByPeriod(shifts, 'month', february).map(({ id }) => id)).toEqual([1, 2]);
  });

  test('returns all shifts in their original order without mutation for all time', () => {
    const shifts = [shift(2, '2025-01-01'), shift(1, '2026-07-29')];
    const result = filterWorkShiftsByPeriod(shifts, 'allTime', july29);
    expect(result).toEqual(shifts);
    expect(result).not.toBe(shifts);
    expect(shifts.map(({ id }) => id)).toEqual([2, 1]);
  });

  test('uses date-only strings rather than UTC parsing', () => {
    expect(filterWorkShiftsByPeriod([shift(1, '2026-07-29')], 'today', july29)).toHaveLength(1);
  });
});
