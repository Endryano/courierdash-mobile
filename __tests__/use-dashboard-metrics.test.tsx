import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { WorkShift } from '@/features/work/domain/workShift';
import type { WorkShiftsContextValue } from '@/features/work/provider/workShiftsContext';

const mockRetry = jest.fn<() => Promise<void>>();
let mockWorkState: WorkShiftsContextValue;

jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => mockWorkState }));

const { useDashboardMetrics } = require('@/features/dashboard/hooks/useDashboardMetrics') as typeof import('@/features/dashboard/hooks/useDashboardMetrics');

function shift(income: number): WorkShift {
  return { id: 1, date: '2026-07-29', hours: 2, km: 4, analytics: { platforms: {
    uber: { income, orders: 1, appTips: null, cashTips: 0, bonuses: null }, wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
  } } };
}

function Probe({ period = 'allTime', now = new Date(2026, 6, 29, 12, 0, 0) }: { readonly period?: 'today' | 'week' | 'month' | 'allTime'; readonly now?: Date }) {
  const state = useDashboardMetrics(period, now);
  return <Text onPress={'retry' in state ? state.retry : undefined}>{state.status === 'ready' ? `${state.status}:${state.metrics.totalIncome}` : state.status}</Text>;
}

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
    mockWorkState = { status: 'loading', shifts: [], retry: mockRetry, subjectUserId: 'user-1' };
  });

  test('directly projects loading, empty, ready, and refreshed canonical work shifts', async () => {
    const view = await render(<Probe />);
    expect(screen.getByText('loading')).toBeTruthy();

    mockWorkState = { status: 'empty', shifts: [], retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    expect(screen.getByText('empty')).toBeTruthy();

    mockWorkState = { status: 'ready', shifts: [shift(10)], retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    expect(screen.getByText('ready:10')).toBeTruthy();

    mockWorkState = { status: 'ready', shifts: [shift(20)], retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    expect(screen.getByText('ready:20')).toBeTruthy();
  });

  test('projects safe errors and delegates retry only to the canonical provider', async () => {
    mockWorkState = { status: 'recoverable_error', shifts: [], error: 'network_unavailable', retry: mockRetry, subjectUserId: 'user-1' };
    const view = await render(<Probe />);
    expect(screen.getByText('recoverable_error')).toBeTruthy();
    await screen.getByText('recoverable_error').props.onPress();
    expect(mockRetry).toHaveBeenCalledTimes(1);

    mockWorkState = { status: 'blocked', shifts: [], error: 'forbidden', retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    expect(screen.getByText('blocked')).toBeTruthy();
  });

  test('filters before calculating and never treats a zero-metric matching shift as period empty', async () => {
    const zeroShift = shift(0);
    mockWorkState = { status: 'ready', shifts: [{ ...zeroShift, date: '2026-07-29' }, { ...shift(10), id: 2, date: '2026-06-01' }], retry: mockRetry, subjectUserId: 'user-1' };
    const view = await render(<Probe period="today" />);
    expect(screen.getByText('ready:0')).toBeTruthy();

    await view.rerender(<Probe period="month" />);
    expect(screen.getByText('ready:0')).toBeTruthy();

    await view.rerender(<Probe period="allTime" />);
    expect(screen.getByText('ready:10')).toBeTruthy();

    await view.rerender(<Probe period="week" now={new Date(2026, 6, 20, 12, 0, 0)} />);
    expect(screen.getByText('period_empty')).toBeTruthy();
    expect(mockWorkState.shifts).toHaveLength(2);
  });
});
