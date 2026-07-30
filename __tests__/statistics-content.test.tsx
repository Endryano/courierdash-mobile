import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { StatisticsMetricsState } from '@/features/statistics/hooks/useStatisticsMetrics';
import { formatCurrency } from '@/lib/formatters';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockRetry = jest.fn<() => Promise<void>>();
let mockStatisticsState: StatisticsMetricsState;
const mockUseStatisticsMetrics = jest.fn<(period?: string) => StatisticsMetricsState>();

jest.mock('@/features/statistics/hooks/useStatisticsMetrics', () => ({ useStatisticsMetrics: (period?: string) => mockUseStatisticsMetrics(period) }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));

const { StatisticsContent } = require('@/features/statistics/components/StatisticsContent') as typeof import('@/features/statistics/components/StatisticsContent');

const metrics = {
  totalBrutto: 100, baseIncome: 50, appTips: 10, cashTips: 15, bonuses: 25, orders: 8, workedTime: 4.5, distance: 12.5, shiftCount: 1,
  platforms: {
    uber: { brutto: 100, orders: 8 }, wolt: { brutto: 0, orders: 0 }, bolt: { brutto: 0, orders: 0 }, glovo: { brutto: 0, orders: 0 }, stuart: { brutto: 0, orders: 0 }, other: { brutto: 0, orders: 0 },
  },
} as const;

function renderStatistics() {
  return render(<ThemeProvider><StatisticsContent /></ThemeProvider>);
}

describe('StatisticsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
    mockStatisticsState = { status: 'ready', metrics };
    mockUseStatisticsMetrics.mockImplementation(() => mockStatisticsState);
  });

  test('renders localized summary labels, period controls, and all six platform rows', async () => {
    await renderStatistics();

    for (const label of ['statistics.title', 'statistics.totalBrutto', 'statistics.baseIncome', 'statistics.appTips', 'statistics.cashTips', 'statistics.bonuses', 'statistics.orders', 'statistics.workedTime', 'statistics.distance', 'statistics.shiftCount', 'statistics.platformBreakdown']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    for (const platform of ['work.platform.uber', 'work.platform.wolt', 'work.platform.bolt', 'work.platform.glovo', 'work.platform.stuart', 'work.platform.other']) {
      expect(screen.getByText(platform)).toBeTruthy();
    }
    expect(screen.getByTestId('statistics-period-week').props.accessibilityState).toEqual({ selected: true });
    expect(screen.queryByText(/NaN|Infinity|permission denied/)).toBeNull();
  });

  test('changes the selected period and renders zero values', async () => {
    mockUseStatisticsMetrics.mockImplementation((period) => period === 'today' ? { status: 'ready', metrics: { ...metrics, totalBrutto: 0 } } : mockStatisticsState);
    await renderStatistics();
    await fireEvent.press(screen.getByTestId('statistics-period-today'));

    expect(screen.getByTestId('statistics-period-today').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getAllByText(formatCurrency('en', 0))).not.toHaveLength(0);
  });

  test('renders safe loading, empty, period-empty, recoverable, and blocked states', async () => {
    mockStatisticsState = { status: 'loading' };
    const view = await renderStatistics();
    expect(screen.getByText('statistics.loading')).toBeTruthy();

    mockStatisticsState = { status: 'empty' };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    expect(screen.getByText('statistics.empty.title')).toBeTruthy();

    mockStatisticsState = { status: 'period_empty', period: 'week' };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    expect(screen.getByText('statistics.periodEmpty.title')).toBeTruthy();
    expect(screen.getByTestId('statistics-period-allTime')).toBeTruthy();

    mockStatisticsState = { status: 'recoverable_error', retry: mockRetry };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    await fireEvent.press(screen.getByTestId('statistics-retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);

    mockStatisticsState = { status: 'blocked', retry: mockRetry };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    expect(screen.getByText('statistics.blocked.title')).toBeTruthy();
  });
});
