import { describe, expect, test } from '@jest/globals';

import { calculateDashboardRecords } from '@/features/dashboard/domain/dashboardRecords';
import type { WorkShift } from '@/features/work/domain/workShift';

function shift(id: number, values: { readonly income?: number; readonly appTips?: number | null; readonly cashTips?: number; readonly bonuses?: number | null; readonly orders?: number | null; readonly hours?: number; readonly km?: number }): WorkShift {
  return {
    id,
    date: '2026-08-01',
    hours: values.hours ?? 1,
    km: values.km ?? 1,
    analytics: {
      platforms: {
        uber: { appTips: values.appTips ?? null, bonuses: values.bonuses ?? null, cashTips: values.cashTips ?? 0, income: values.income ?? 0, orders: values.orders ?? null },
        wolt: { appTips: null, bonuses: null, cashTips: 0, income: 0, orders: null },
        bolt: { appTips: null, bonuses: null, cashTips: 0, income: 0, orders: null },
        glovo: { appTips: null, bonuses: null, cashTips: 0, income: 0, orders: null },
        stuart: { appTips: 0, bonuses: 0, cashTips: 0, income: 0, orders: 0 },
        other: { appTips: 0, bonuses: 0, cashTips: 0, income: 0, name: null, orders: 0 },
      },
    },
  };
}

describe('calculateDashboardRecords', () => {
  test('returns the four canonical per-shift records without mutating the filtered input', () => {
    const shifts = [
      shift(1, { appTips: 10, bonuses: 20, cashTips: 5, hours: 5, income: 100, km: 10, orders: 30 }),
      shift(2, { hours: 2, income: 120, km: 6, orders: 25 }),
    ];
    const originalOrder = shifts.map(({ id }) => id);

    expect(calculateDashboardRecords(shifts)).toEqual({
      bestHourlyRate: { date: '2026-08-01', value: 60 },
      bestIncomePerKilometer: { date: '2026-08-01', value: 20 },
      highestIncome: { date: '2026-08-01', value: 135 },
      mostOrders: { date: '2026-08-01', value: 30 },
    });
    expect(shifts.map(({ id }) => id)).toEqual(originalOrder);
  });

  test('uses only the provided period-filtered collection', () => {
    const selectedPeriodShifts = [shift(1, { hours: 4, income: 80, km: 8, orders: 8 })];

    expect(calculateDashboardRecords(selectedPeriodShifts)).toEqual({
      bestHourlyRate: { date: '2026-08-01', value: 20 },
      bestIncomePerKilometer: { date: '2026-08-01', value: 10 },
      highestIncome: { date: '2026-08-01', value: 80 },
      mostOrders: { date: '2026-08-01', value: 8 },
    });
  });

  test('uses canonical orders aggregated across the platforms of one shift', () => {
    const multiPlatformShift = shift(1, { income: 10, orders: 12 });
    const shifts = [{
      ...multiPlatformShift,
      analytics: {
        platforms: {
          ...multiPlatformShift.analytics.platforms,
          wolt: { ...multiPlatformShift.analytics.platforms.wolt, orders: 31 },
        },
      },
    }];

    expect(calculateDashboardRecords(shifts).mostOrders.value).toBe(43);
  });

  test('returns unavailable rate records for invalid denominators without NaN or Infinity', () => {
    const shifts = [
      shift(1, { hours: 0, income: 500, km: 0, orders: 2 }),
      shift(2, { hours: Number.NaN, income: 400, km: Number.NaN, orders: 4 }),
    ];
    const records = calculateDashboardRecords(shifts);

    expect(records).toEqual({
      bestHourlyRate: { date: null, value: null },
      bestIncomePerKilometer: { date: null, value: null },
      highestIncome: { date: '2026-08-01', value: 500 },
      mostOrders: { date: '2026-08-01', value: 4 },
    });
    expect(Object.values(records).every(({ value }) => value === null || Number.isFinite(value))).toBe(true);
  });

  test('returns safe unavailable values for an empty filtered collection', () => {
    expect(calculateDashboardRecords([])).toEqual({
      bestHourlyRate: { date: null, value: null },
      bestIncomePerKilometer: { date: null, value: null },
      highestIncome: { date: null, value: null },
      mostOrders: { date: null, value: null },
    });
  });

  test('breaks equal records by the most recent canonical shift date', () => {
    const shifts = [
      { ...shift(1, { hours: 2, income: 100, km: 5, orders: 10 }), date: '2026-07-01' },
      { ...shift(2, { hours: 2, income: 100, km: 5, orders: 10 }), date: '2026-07-03' },
    ];

    expect(calculateDashboardRecords(shifts)).toEqual({
      bestHourlyRate: { date: '2026-07-03', value: 50 },
      bestIncomePerKilometer: { date: '2026-07-03', value: 20 },
      highestIncome: { date: '2026-07-03', value: 100 },
      mostOrders: { date: '2026-07-03', value: 10 },
    });
  });
});
