import type { WorkShift } from '@/features/work/domain/workShift';

export type DashboardMetrics = {
  readonly totalIncome: number;
  readonly totalHours: number;
  readonly totalOrders: number;
  readonly totalKilometers: number;
  readonly totalShifts: number;
  readonly incomePerHour: number;
  readonly incomePerOrder: number;
  readonly incomePerKilometer: number;
};

type DashboardPlatform = {
  readonly income: number;
  readonly orders: number | null;
  readonly appTips: number | null;
  readonly cashTips: number;
  readonly bonuses: number | null;
};

const platformKeys = ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other'] as const;

function nullableContribution(value: number | null): number {
  return value === null ? 0 : value;
}

function calculatePlatformIncome(platform: DashboardPlatform): number {
  return platform.income
    + nullableContribution(platform.appTips)
    + platform.cashTips
    + nullableContribution(platform.bonuses);
}

function calculatePlatformOrders(platform: DashboardPlatform): number {
  return nullableContribution(platform.orders);
}

function safeRate(totalIncome: number, denominator: number): number {
  return denominator > 0 ? totalIncome / denominator : 0;
}

export function calculateDashboardMetrics(shifts: readonly WorkShift[]): DashboardMetrics {
  let totalIncome = 0;
  let totalHours = 0;
  let totalOrders = 0;
  let totalKilometers = 0;

  for (const shift of shifts) {
    totalHours += shift.hours;
    totalKilometers += shift.km;

    for (const key of platformKeys) {
      const platform = shift.analytics.platforms[key];
      totalIncome += calculatePlatformIncome(platform);
      totalOrders += calculatePlatformOrders(platform);
    }
  }

  return {
    totalIncome,
    totalHours,
    totalOrders,
    totalKilometers,
    totalShifts: shifts.length,
    incomePerHour: safeRate(totalIncome, totalHours),
    incomePerOrder: safeRate(totalIncome, totalOrders),
    incomePerKilometer: safeRate(totalIncome, totalKilometers),
  };
}
