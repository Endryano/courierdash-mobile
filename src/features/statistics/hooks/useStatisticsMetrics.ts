import { useMemo } from 'react';

import { useWorkShifts } from '@/features/work/hooks/useWorkShifts';
import {
  defaultWorkShiftPeriod,
  filterWorkShiftsByPeriod,
  type WorkShiftPeriod,
} from '@/features/work/domain/workShiftPeriod';

import { calculateStatisticsMetrics, type StatisticsMetrics } from '../domain/statisticsMetrics';

export type StatisticsMetricsState =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'period_empty'; readonly period: WorkShiftPeriod }
  | { readonly status: 'ready'; readonly metrics: StatisticsMetrics }
  | { readonly status: 'recoverable_error'; readonly retry: () => Promise<void> }
  | { readonly status: 'blocked'; readonly retry: () => Promise<void> };

export function useStatisticsMetrics(
  period: WorkShiftPeriod = defaultWorkShiftPeriod,
  now: Date = new Date(),
): StatisticsMetricsState {
  const workShifts = useWorkShifts();
  const filteredShifts = useMemo(
    () => filterWorkShiftsByPeriod(workShifts.shifts, period, now),
    [now, period, workShifts.shifts],
  );
  const metrics = useMemo(() => calculateStatisticsMetrics(filteredShifts), [filteredShifts]);

  if (workShifts.status === 'idle' || workShifts.status === 'loading') return { status: 'loading' };
  if (workShifts.status === 'recoverable_error' || workShifts.status === 'blocked') {
    return { status: workShifts.status, retry: workShifts.retry };
  }
  if (workShifts.status === 'empty' || workShifts.shifts.length === 0) return { status: 'empty' };
  if (filteredShifts.length === 0) return { status: 'period_empty', period };

  return { status: 'ready', metrics };
}
