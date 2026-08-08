import type { WorkShift } from '@/features/work/domain/workShift';
import { calculateWorkShiftBrutto, calculateWorkShiftOrders } from '@/features/work/domain/workShiftAnalytics';
import { isCanonicalWorkShiftDate } from '@/features/work/domain/workShiftDate';

export type DashboardRecord = {
  readonly value: number | null;
  readonly date: string | null;
};

export type DashboardRecords = {
  readonly highestIncome: DashboardRecord;
  readonly bestHourlyRate: DashboardRecord;
  readonly mostOrders: DashboardRecord;
  readonly bestIncomePerKilometer: DashboardRecord;
};

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

const unavailableRecord: DashboardRecord = { date: null, value: null };

function maximum(current: DashboardRecord, candidate: number, date: string | null): DashboardRecord {
  if (!Number.isFinite(candidate)) return current;

  if (current.value === null || candidate > current.value || (candidate === current.value && date !== null && (current.date === null || date > current.date))) {
    return { date, value: candidate };
  }

  return current;
}

export function calculateDashboardRecords(shifts: readonly WorkShift[]): DashboardRecords {
  let highestIncome = unavailableRecord;
  let bestHourlyRate = unavailableRecord;
  let mostOrders = unavailableRecord;
  let bestIncomePerKilometer = unavailableRecord;

  for (const shift of shifts) {
    const brutto = calculateWorkShiftBrutto(shift);
    const orders = calculateWorkShiftOrders(shift);
    const date = isCanonicalWorkShiftDate(shift.date) ? shift.date : null;

    highestIncome = maximum(highestIncome, brutto, date);
    mostOrders = maximum(mostOrders, orders, date);

    if (Number.isFinite(brutto) && isPositiveFiniteNumber(shift.hours)) {
      bestHourlyRate = maximum(bestHourlyRate, brutto / shift.hours, date);
    }

    if (Number.isFinite(brutto) && isPositiveFiniteNumber(shift.km)) {
      bestIncomePerKilometer = maximum(bestIncomePerKilometer, brutto / shift.km, date);
    }
  }

  return { highestIncome, bestHourlyRate, mostOrders, bestIncomePerKilometer };
}
