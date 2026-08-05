import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { WorkShift } from '@/features/work/domain/workShift';
import type { WorkShiftsContextValue } from '@/features/work/provider/workShiftsContext';

const mockRetry = jest.fn<() => Promise<void>>();
let mockWorkState: WorkShiftsContextValue;
let mockForegroundDate: Date;

jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => mockWorkState }));
jest.mock('@/lib/lifecycle/foregroundDate', () => ({ useForegroundDate: () => mockForegroundDate }));

const { useStatisticsMetrics } = require('@/features/statistics/hooks/useStatisticsMetrics') as typeof import('@/features/statistics/hooks/useStatisticsMetrics');

function shift(income: number, date = '2026-07-29'): WorkShift {
  return { id: 1, date, hours: 2, km: 4, analytics: { platforms: {
    uber: { income, orders: 1, appTips: null, cashTips: 0, bonuses: null }, wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
  } } };
}

function Probe({ period = 'allTime', now }: { readonly period?: 'today' | 'week' | 'month' | 'allTime'; readonly now?: Date }) {
  const state = useStatisticsMetrics(period, now);
  return <Text onPress={'retry' in state ? state.retry : undefined}>{state.status === 'ready' ? `${state.status}:${state.metrics.totalBrutto}` : state.status}</Text>;
}

describe('useStatisticsMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
    mockForegroundDate = new Date(2026, 6, 29, 12);
    mockWorkState = { status: 'loading', shifts: [], retry: mockRetry, subjectUserId: 'user-1' };
  });

  test('projects canonical loading, empty, ready, and changed Work data', async () => {
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

  test('uses shared period filtering and delegates retry to the canonical provider', async () => {
    mockWorkState = { status: 'ready', shifts: [shift(0), { ...shift(10, '2026-06-01'), id: 2 }], retry: mockRetry, subjectUserId: 'user-1' };
    const view = await render(<Probe period="today" />);
    expect(screen.getByText('ready:0')).toBeTruthy();

    await view.rerender(<Probe period="week" now={new Date(2026, 6, 20, 12)} />);
    expect(screen.getByText('period_empty')).toBeTruthy();

    mockWorkState = { status: 'recoverable_error', shifts: [], error: 'network_unavailable', retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    await screen.getByText('recoverable_error').props.onPress();
    expect(mockRetry).toHaveBeenCalledTimes(1);

    mockWorkState = { status: 'blocked', shifts: [], error: 'forbidden', retry: mockRetry, subjectUserId: 'user-1' };
    await view.rerender(<Probe />);
    expect(screen.getByText('blocked')).toBeTruthy();
  });

  test('recalculates selected relative periods from the shared foreground date without retrying Work', async () => {
    mockWorkState = {
      status: 'ready',
      shifts: [shift(10, '2026-07-31'), { ...shift(20, '2026-08-01'), id: 2 }],
      retry: mockRetry,
      subjectUserId: 'user-1',
    };
    mockForegroundDate = new Date(2026, 6, 31, 12);
    const view = await render(<Probe period="month" />);
    expect(screen.getByText('ready:10')).toBeTruthy();

    mockForegroundDate = new Date(2026, 7, 1, 12);
    await view.rerender(<Probe period="month" />);
    expect(screen.getByText('ready:20')).toBeTruthy();
    expect(mockRetry).not.toHaveBeenCalled();

    await view.rerender(<Probe period="allTime" />);
    expect(screen.getByText('ready:30')).toBeTruthy();
    expect(mockRetry).not.toHaveBeenCalled();
  });
});
