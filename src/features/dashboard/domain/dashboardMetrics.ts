import type { WorkShift } from '@/features/work/domain/workShift';
import {
  calculatePlatformBrutto,
  calculatePlatformOrders,
  workPlatformKeys,
} from '@/features/work/domain/workShiftAnalytics';

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

    for (const key of workPlatformKeys) {
      const platform = shift.analytics.platforms[key];
      totalIncome += calculatePlatformBrutto(platform);
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
