import type { WorkShift } from '@/features/work/domain/workShift';
import { calculateWorkShiftBrutto, calculateWorkShiftOrders } from '@/features/work/domain/workShiftAnalytics';

export type DashboardRecords = {
  readonly highestIncome: number | null;
  readonly bestHourlyRate: number | null;
  readonly mostOrders: number | null;
  readonly bestIncomePerKilometer: number | null;
};

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function maximum(current: number | null, candidate: number): number | null {
  return Number.isFinite(candidate) && (current === null || candidate > current) ? candidate : current;
}

export function calculateDashboardRecords(shifts: readonly WorkShift[]): DashboardRecords {
  let highestIncome: number | null = null;
  let bestHourlyRate: number | null = null;
  let mostOrders: number | null = null;
  let bestIncomePerKilometer: number | null = null;

  for (const shift of shifts) {
    const brutto = calculateWorkShiftBrutto(shift);
    const orders = calculateWorkShiftOrders(shift);

    highestIncome = maximum(highestIncome, brutto);
    mostOrders = maximum(mostOrders, orders);

    if (Number.isFinite(brutto) && isPositiveFiniteNumber(shift.hours)) {
      bestHourlyRate = maximum(bestHourlyRate, brutto / shift.hours);
    }

    if (Number.isFinite(brutto) && isPositiveFiniteNumber(shift.km)) {
      bestIncomePerKilometer = maximum(bestIncomePerKilometer, brutto / shift.km);
    }
  }

  return { highestIncome, bestHourlyRate, mostOrders, bestIncomePerKilometer };
}
