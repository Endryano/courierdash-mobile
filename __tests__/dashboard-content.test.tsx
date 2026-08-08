import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { DashboardMetricsState } from '@/features/dashboard/hooks/useDashboardMetrics';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockRetry = jest.fn<() => Promise<void>>();
let mockDashboardState: DashboardMetricsState;
const mockUseDashboardMetrics = jest.fn<(period?: string) => DashboardMetricsState>();

jest.mock('@/features/dashboard/hooks/useDashboardMetrics', () => ({ useDashboardMetrics: (period?: string) => mockUseDashboardMetrics(period) }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('react-native-safe-area-context', () => ({
  ...(jest.requireActual('react-native-safe-area-context') as object),
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

const { DashboardContent } = require('@/features/dashboard/components/DashboardContent') as typeof import('@/features/dashboard/components/DashboardContent');

function renderDashboard() {
  return render(<ThemeProvider><DashboardContent /></ThemeProvider>);
}

describe('DashboardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
    mockDashboardState = { status: 'ready', metrics: { totalIncome: 360, totalHours: 8, totalOrders: 105, totalKilometers: 20, totalShifts: 1, incomePerHour: 45, incomePerOrder: 360 / 105, incomePerKilometer: 18 } };
    mockUseDashboardMetrics.mockImplementation(() => mockDashboardState);
  });

  test('renders the Brutto-first hero, metric sections, and PLN formatted canonical values', async () => {
    await renderDashboard();

    expect(screen.getByText('navigation.tab.dashboard')).toBeTruthy();
    for (const label of ['dashboard.totalIncome', 'dashboard.label.hours', 'dashboard.label.orders', 'dashboard.label.kilometers', 'dashboard.label.shifts', 'dashboard.incomePerOrder', 'dashboard.incomePerKilometer', 'dashboard.section.total.week', 'dashboard.section.average']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getAllByText('dashboard.incomePerHour')).toHaveLength(1);
    expect(screen.getByText('360.00')).toBeTruthy();
    expect(screen.getAllByText('45.00')).toHaveLength(1);
    expect(screen.queryByText(/NaN|Infinity/)).toBeNull();
    expect(screen.queryByText('work.create.action')).toBeNull();
    expect(screen.getByTestId('dashboard-period-week').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('dashboard-period-week').parent?.props.accessibilityLabel).toBe('dashboard.period.label');
    expect(screen.getByText('navigation.tab.dashboard').props.accessibilityRole).toBe('header');
    expect(screen.getByText('dashboard.section.total.week').props.accessibilityRole).toBe('header');
    expect(screen.getByText('dashboard.section.average').props.accessibilityRole).toBe('header');
  });

  test('changes the selected period and updates displayed KPI values', async () => {
    mockUseDashboardMetrics.mockImplementation((period) => period === 'today'
      ? { status: 'ready', metrics: { totalIncome: 25, totalHours: 1, totalOrders: 1, totalKilometers: 2, totalShifts: 1, incomePerHour: 25, incomePerOrder: 25, incomePerKilometer: 12.5 } }
      : mockDashboardState);
    await renderDashboard();
    await fireEvent.press(screen.getByTestId('dashboard-period-today'));

    expect(screen.getByTestId('dashboard-period-today').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByText('dashboard.section.total.today')).toBeTruthy();
    expect(screen.getAllByText('25.00')).not.toHaveLength(0);
  });

  test('keeps every canonical period option interactive and selected-state controlled', async () => {
    await renderDashboard();

    for (const period of ['today', 'week', 'month', 'allTime'] as const) {
      await fireEvent.press(screen.getByTestId(`dashboard-period-${period}`));
      expect(screen.getByTestId(`dashboard-period-${period}`).props.accessibilityState).toEqual({ selected: true });
    }
  });

  test('renders loading and empty states without placeholder metrics', async () => {
    mockDashboardState = { status: 'loading' };
    const view = await renderDashboard();
    expect(screen.getByText('dashboard.loading')).toBeTruthy();

    mockDashboardState = { status: 'empty' };
    await view.rerender(<ThemeProvider><DashboardContent /></ThemeProvider>);
    expect(screen.getByText('dashboard.empty.title')).toBeTruthy();
    expect(screen.queryByText('dashboard.totalIncome')).toBeNull();
  });

  test('renders a safe error and delegates retry without raw backend text', async () => {
    mockDashboardState = { status: 'recoverable_error', retry: mockRetry };
    const view = await renderDashboard();
    expect(screen.getByText('dashboard.error.title')).toBeTruthy();
    expect(screen.queryByText('permission denied')).toBeNull();
    await fireEvent.press(screen.getByTestId('dashboard-retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);

    mockDashboardState = { status: 'blocked', retry: mockRetry };
    await view.rerender(<ThemeProvider><DashboardContent /></ThemeProvider>);
    expect(screen.getByText('dashboard.error.title')).toBeTruthy();
  });

  test('handles a rejected canonical retry without exposing a backend error', async () => {
    mockRetry.mockRejectedValueOnce(new Error('permission denied'));
    mockDashboardState = { status: 'recoverable_error', retry: mockRetry };
    await renderDashboard();

    await fireEvent.press(screen.getByTestId('dashboard-retry'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('permission denied')).toBeNull();
  });

  test('formats zero denominator rates safely without charts or filters', async () => {
    mockDashboardState = { status: 'ready', metrics: { totalIncome: 1, totalHours: 0, totalOrders: 0, totalKilometers: 0, totalShifts: 1, incomePerHour: 0, incomePerOrder: 0, incomePerKilometer: 0 } };
    await renderDashboard();

    expect(screen.getAllByText('0.00')).toHaveLength(3);
    expect(screen.queryByText(/NaN|Infinity/)).toBeNull();
    expect(screen.queryByText('chart')).toBeNull();
  });

  test('keeps period controls available for a period-specific empty state', async () => {
    mockDashboardState = { status: 'period_empty', period: 'week' };
    await renderDashboard();

    expect(screen.getByText('dashboard.periodEmpty.title')).toBeTruthy();
    expect(screen.getByText('navigation.tab.dashboard')).toBeTruthy();
    expect(screen.getByTestId('dashboard-period-allTime')).toBeTruthy();
    expect(screen.queryByText('dashboard.totalIncome')).toBeNull();
  });
});
