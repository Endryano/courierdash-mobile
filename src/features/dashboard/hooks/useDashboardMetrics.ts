import { useMemo } from 'react';

import { useWorkShifts } from '@/features/work/hooks/useWorkShifts';
import { useForegroundDate } from '@/lib/lifecycle/foregroundDate';

import { calculateDashboardMetrics, type DashboardMetrics } from '../domain/dashboardMetrics';
import { calculateDashboardRecords, type DashboardRecords } from '../domain/dashboardRecords';
import { defaultDashboardPeriod, filterWorkShiftsByPeriod, type DashboardPeriod } from '../domain/dashboardPeriod';

export type DashboardMetricsState =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'period_empty'; readonly period: DashboardPeriod }
  | { readonly status: 'ready'; readonly metrics: DashboardMetrics; readonly records: DashboardRecords }
  | { readonly status: 'recoverable_error'; readonly retry: () => Promise<void> }
  | { readonly status: 'blocked'; readonly retry: () => Promise<void> };

export function useDashboardMetrics(period: DashboardPeriod = defaultDashboardPeriod, now?: Date): DashboardMetricsState {
  const workShifts = useWorkShifts();
  const foregroundDate = useForegroundDate();
  const referenceDate = now ?? foregroundDate;
  const filteredShifts = useMemo(
    () => filterWorkShiftsByPeriod(workShifts.shifts, period, referenceDate),
    [period, referenceDate, workShifts.shifts],
  );
  const metrics = useMemo(
    () => calculateDashboardMetrics(filteredShifts),
    [filteredShifts],
  );
  const records = useMemo(
    () => calculateDashboardRecords(filteredShifts),
    [filteredShifts],
  );

  if (workShifts.status === 'idle' || workShifts.status === 'loading') {
    return { status: 'loading' };
  }

  if (workShifts.status === 'recoverable_error' || workShifts.status === 'blocked') {
    return { status: workShifts.status, retry: workShifts.retry };
  }

  if (workShifts.status === 'empty' || workShifts.shifts.length === 0) {
    return { status: 'empty' };
  }

  if (filteredShifts.length === 0) {
    return { status: 'period_empty', period };
  }

  return { status: 'ready', metrics, records };
}
