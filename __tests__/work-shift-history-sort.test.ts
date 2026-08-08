import { describe, expect, test } from '@jest/globals';

import type { WorkShift } from '@/features/work/domain/workShift';
import { sortWorkShiftHistory } from '@/features/work/domain/workShiftHistorySort';

function createShift(id: number, date: string, km: number, income: number): WorkShift {
  return {
    id,
    date,
    hours: 8,
    km,
    analytics: {
      platforms: {
        uber: { income, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        wolt: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        bolt: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        glovo: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
      },
    },
  };
}

const shifts = [
  createShift(1, '2026-08-01', 40, 100),
  createShift(2, '2026-08-03', 20, 300),
  createShift(3, '2026-08-02', 60, 200),
];

function ids(mode: Parameters<typeof sortWorkShiftHistory>[1]) {
  return sortWorkShiftHistory(shifts, mode).map((shift) => shift.id);
}

describe('Work Shift History sorting', () => {
  test('sorts canonical Brutto income in both directions', () => {
    expect(ids('income_desc')).toEqual([2, 3, 1]);
    expect(ids('income_asc')).toEqual([1, 3, 2]);
  });

  test('sorts distance in both directions', () => {
    expect(ids('distance_desc')).toEqual([3, 1, 2]);
    expect(ids('distance_asc')).toEqual([2, 1, 3]);
  });

  test('sorts canonical local date strings in both directions', () => {
    expect(ids('date_desc')).toEqual([2, 3, 1]);
    expect(ids('date_asc')).toEqual([1, 3, 2]);
  });

  test('uses newest date as the numeric tie-breaker without mutating source shifts', () => {
    const tiedShifts = [
      createShift(1, '2026-08-01', 20, 100),
      createShift(2, '2026-08-03', 20, 100),
    ];

    expect(sortWorkShiftHistory(tiedShifts, 'income_desc').map((shift) => shift.id)).toEqual([2, 1]);
    expect(tiedShifts.map((shift) => shift.id)).toEqual([1, 2]);
  });
});
