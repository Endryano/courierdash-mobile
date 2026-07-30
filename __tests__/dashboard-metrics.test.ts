import { describe, expect, test } from '@jest/globals';

import { calculateDashboardMetrics } from '@/features/dashboard/domain/dashboardMetrics';
import type { WorkShift } from '@/features/work/domain/workShift';

function createShift(overrides: Partial<WorkShift> = {}): WorkShift {
  return {
    id: 1,
    date: '2026-07-29',
    hours: 8,
    km: 20,
    analytics: {
      platforms: {
        uber: { income: 1, orders: 5, appTips: 2, cashTips: 3, bonuses: 4 },
        wolt: { income: 6, orders: 10, appTips: 7, cashTips: 8, bonuses: 9 },
        bolt: { income: 11, orders: 15, appTips: 12, cashTips: 13, bonuses: 14 },
        glovo: { income: 16, orders: 20, appTips: 17, cashTips: 18, bonuses: 19 },
        stuart: { income: 21, orders: 25, appTips: 22, cashTips: 23, bonuses: 24 },
        other: { income: 26, orders: 30, appTips: 27, cashTips: 28, bonuses: 29, name: 'Other' },
      },
    },
    ...overrides,
  };
}

describe('calculateDashboardMetrics', () => {
  test('returns finite zero metrics for an empty input', () => {
    const metrics = calculateDashboardMetrics([]);

    expect(metrics).toEqual({ totalIncome: 0, totalHours: 0, totalOrders: 0, totalKilometers: 0, totalShifts: 0, incomePerHour: 0, incomePerOrder: 0, incomePerKilometer: 0 });
    expect(Object.values(metrics).every(Number.isFinite)).toBe(true);
  });

  test('includes every approved metric from all six distinct platforms exactly once', () => {
    const metrics = calculateDashboardMetrics([createShift()]);

    expect(metrics).toEqual({ totalIncome: 360, totalHours: 8, totalOrders: 105, totalKilometers: 20, totalShifts: 1, incomePerHour: 45, incomePerOrder: 360 / 105, incomePerKilometer: 18 });
  });

  test('aggregates multiple shifts with weighted rates rather than averages of shift rates', () => {
    const highHours = createShift({ id: 1, hours: 10, km: 10, analytics: { platforms: {
      uber: { income: 100, orders: 10, appTips: null, cashTips: 0, bonuses: null },
      wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
    } } });
    const lowHours = createShift({ id: 2, hours: 1, km: 1, analytics: highHours.analytics });

    const metrics = calculateDashboardMetrics([highHours, lowHours]);

    expect(metrics.totalIncome).toBe(200);
    expect(metrics.totalHours).toBe(11);
    expect(metrics.incomePerHour).toBe(200 / 11);
    expect(metrics.incomePerHour).not.toBe(55);
  });

  test('contributes zero for nullable metrics without changing canonical null or numeric zero values', () => {
    const shift = createShift({ analytics: { platforms: {
      uber: { income: 1.25, orders: null, appTips: null, cashTips: 0, bonuses: null },
      wolt: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: 'ignored' },
    } } });
    const before = JSON.parse(JSON.stringify(shift));

    expect(calculateDashboardMetrics([shift])).toMatchObject({ totalIncome: 1.25, totalOrders: 0, incomePerOrder: 0 });
    expect(shift).toEqual(before);
    expect(shift.analytics.platforms.uber.orders).toBeNull();
    expect(shift.analytics.platforms.wolt.orders).toBe(0);
  });

  test('guards all zero denominators and preserves decimal precision', () => {
    const shift = createShift({ hours: 0, km: 0, analytics: { platforms: {
      uber: { income: 0.123, orders: 0, appTips: 0.456, cashTips: 0.789, bonuses: 0.012 },
      wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: 'not income' },
    } } });

    const metrics = calculateDashboardMetrics([shift]);

    expect(metrics.totalIncome).toBe(1.38);
    expect(metrics.incomePerHour).toBe(0);
    expect(metrics.incomePerOrder).toBe(0);
    expect(metrics.incomePerKilometer).toBe(0);
  });

  test('does not let non-income fields or the Other name affect gross income', () => {
    const first = createShift({ hours: 1, km: 1, analytics: { platforms: {
      uber: { income: 10, orders: 1, appTips: null, cashTips: 0, bonuses: null },
      wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: 'One' },
    } } });
    const second = createShift({ ...first, hours: 99, km: 999, analytics: { platforms: { ...first.analytics.platforms, uber: { ...first.analytics.platforms.uber, orders: 999 }, other: { ...first.analytics.platforms.other, name: 'Two' } } } });

    expect(calculateDashboardMetrics([first]).totalIncome).toBe(calculateDashboardMetrics([second]).totalIncome);
  });

  test('keeps large reasonable canonical values finite', () => {
    const shifts = Array.from({ length: 100 }, (_, index) => createShift({ id: index + 1, hours: 1_000_000, km: 1_000_000 }));
    const metrics = calculateDashboardMetrics(shifts);

    expect(Object.values(metrics).every(Number.isFinite)).toBe(true);
    expect(metrics.totalShifts).toBe(100);
  });
});
