import { describe, expect, test } from '@jest/globals';

import { calculateStatisticsMetrics } from '@/features/statistics/domain/statisticsMetrics';
import type { WorkShift } from '@/features/work/domain/workShift';

function shift(overrides: Partial<WorkShift> = {}): WorkShift {
  return {
    id: 1,
    date: '2026-07-29',
    hours: 8.5,
    km: 20.25,
    analytics: { platforms: {
      uber: { income: 10, orders: 1, appTips: 2, cashTips: 3, bonuses: 4 },
      wolt: { income: 20, orders: 2, appTips: 3, cashTips: 4, bonuses: 5 },
      bolt: { income: 30, orders: 3, appTips: 4, cashTips: 5, bonuses: 6 },
      glovo: { income: 40, orders: 4, appTips: 5, cashTips: 6, bonuses: 7 },
      stuart: { income: 50, orders: 5, appTips: 6, cashTips: 7, bonuses: 8 },
      other: { income: 60, orders: 6, appTips: 7, cashTips: 8, bonuses: 9, name: 'Bike delivery' },
    } },
    ...overrides,
  };
}

describe('calculateStatisticsMetrics', () => {
  test('aggregates Brutto composition, Work totals, and all six platform categories', () => {
    const metrics = calculateStatisticsMetrics([shift()]);

    expect(metrics).toEqual({
      totalBrutto: 309,
      baseIncome: 210,
      appTips: 27,
      cashTips: 33,
      bonuses: 39,
      orders: 21,
      workedTime: 8.5,
      distance: 20.25,
      shiftCount: 1,
      platforms: {
        uber: { brutto: 19, orders: 1 }, wolt: { brutto: 32, orders: 2 }, bolt: { brutto: 45, orders: 3 },
        glovo: { brutto: 58, orders: 4 }, stuart: { brutto: 71, orders: 5 }, other: { brutto: 84, orders: 6 },
      },
    });
  });

  test('treats nullable values as zero, preserves zero categories, and never returns non-finite values', () => {
    const metrics = calculateStatisticsMetrics([shift({ hours: 0, km: 0, analytics: { platforms: {
      uber: { income: 1.25, orders: null, appTips: null, cashTips: 0.5, bonuses: null },
      wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
    } } })]);

    expect(metrics).toMatchObject({ totalBrutto: 1.75, baseIncome: 1.25, appTips: 0, cashTips: 0.5, bonuses: 0, orders: 0, workedTime: 0, distance: 0, shiftCount: 1 });
    expect(metrics.platforms.other).toEqual({ brutto: 0, orders: 0 });
    expect(Object.values(metrics.platforms).flatMap(Object.values).every(Number.isFinite)).toBe(true);
    expect(Object.values(metrics).filter((value): value is number => typeof value === 'number').every(Number.isFinite)).toBe(true);
  });

  test('aggregates Other independently of individual names and does not mutate shifts', () => {
    const first = shift({ id: 1, analytics: { platforms: { ...shift().analytics.platforms, other: { income: 10, orders: 2, appTips: 1, cashTips: 1, bonuses: 1, name: 'First' } } } });
    const second = shift({ id: 2, analytics: { platforms: { ...shift().analytics.platforms, other: { income: 20, orders: 3, appTips: 2, cashTips: 2, bonuses: 2, name: 'Second' } } } });
    const before = JSON.parse(JSON.stringify([first, second]));

    expect(calculateStatisticsMetrics([first, second]).platforms.other).toEqual({ brutto: 39, orders: 5 });
    expect([first, second]).toEqual(before);
  });

  test('returns a complete zero result for no shifts', () => {
    const metrics = calculateStatisticsMetrics([]);

    expect(metrics).toMatchObject({ totalBrutto: 0, baseIncome: 0, appTips: 0, cashTips: 0, bonuses: 0, orders: 0, workedTime: 0, distance: 0, shiftCount: 0 });
    expect(Object.values(metrics.platforms)).toEqual([{ brutto: 0, orders: 0 }, { brutto: 0, orders: 0 }, { brutto: 0, orders: 0 }, { brutto: 0, orders: 0 }, { brutto: 0, orders: 0 }, { brutto: 0, orders: 0 }]);
  });
});
