import type { WorkShift } from '@/features/work/domain/workShift';

export type DashboardPeriod = 'today' | 'week' | 'month' | 'allTime';

export const defaultDashboardPeriod: DashboardPeriod = 'week';

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function weekBoundaryKeys(now: Date): readonly [string, string] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);

  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
  sunday.setDate(sunday.getDate() + 6);

  return [localDateKey(monday), localDateKey(sunday)];
}

export function filterWorkShiftsByPeriod(shifts: readonly WorkShift[], period: DashboardPeriod, now: Date = new Date()): WorkShift[] {
  if (period === 'allTime') return [...shifts];

  if (period === 'today') {
    const today = localDateKey(now);
    return shifts.filter((shift) => shift.date === today);
  }

  if (period === 'month') {
    const month = localDateKey(now).slice(0, 7);
    return shifts.filter((shift) => shift.date.slice(0, 7) === month);
  }

  const [monday, sunday] = weekBoundaryKeys(now);
  return shifts.filter((shift) => shift.date >= monday && shift.date <= sunday);
}
