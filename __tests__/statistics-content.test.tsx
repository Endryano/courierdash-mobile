import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { translations } from '@/i18n/translations';
import type { StatisticsMetrics } from '@/features/statistics/domain/statisticsMetrics';
import type { StatisticsMetricsState } from '@/features/statistics/hooks/useStatisticsMetrics';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockRetry = jest.fn<() => Promise<void>>();
let mockStatisticsState: StatisticsMetricsState;
type MockLocale = 'pl' | 'uk' | 'en' | 'ru';

let mockLocale: MockLocale = 'en';
const mockUseStatisticsMetrics = jest.fn<(period?: string) => StatisticsMetricsState>();
const mockLocalizedValues: Record<MockLocale, Record<string, string>> = {
  en: {
    'statistics.title': 'Statistics', 'statistics.section.incomeComposition': 'Income composition', 'statistics.section.workContext': 'Work context',
    'statistics.period.today': 'Today', 'statistics.period.week': 'This week', 'statistics.period.month': 'This month', 'statistics.period.allTime': 'All time',
    'statistics.totalBrutto': 'Total Brutto', 'statistics.baseIncome': 'Base income', 'statistics.appTips': 'App tips', 'statistics.cashTips': 'Cash tips', 'statistics.bonuses': 'Bonuses', 'statistics.orders': 'Orders', 'statistics.workedTime': 'Worked time', 'statistics.distance': 'Distance', 'statistics.shiftCount': 'Shift count', 'statistics.platformBreakdown': 'By platform', 'statistics.platform.brutto': 'Brutto', 'statistics.platform.orders': 'Orders',
  },
  pl: {
    'statistics.title': 'Statystyki', 'statistics.section.incomeComposition': 'Struktura przychodu', 'statistics.section.workContext': 'Kontekst pracy',
    'statistics.period.today': 'Dzisiaj', 'statistics.period.week': 'Ten tydzień', 'statistics.period.month': 'Ten miesiąc', 'statistics.period.allTime': 'Cały czas',
  },
  uk: {
    'statistics.title': 'Статистика', 'statistics.section.incomeComposition': 'Структура доходу', 'statistics.section.workContext': 'Контекст роботи',
  },
  ru: {
    'statistics.title': 'Статистика', 'statistics.section.incomeComposition': 'Структура дохода', 'statistics.section.workContext': 'Рабочий контекст',
  },
};

jest.mock('@/features/statistics/hooks/useStatisticsMetrics', () => ({ useStatisticsMetrics: (period?: string) => mockUseStatisticsMetrics(period) }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: mockLocale, t: (key: string) => mockLocalizedValues[mockLocale][key] ?? key }) }));

const { StatisticsContent } = require('@/features/statistics/components/StatisticsContent') as typeof import('@/features/statistics/components/StatisticsContent');

const metrics: StatisticsMetrics = {
  totalBrutto: 100, baseIncome: 50, appTips: 10, cashTips: 15, bonuses: 25, orders: 8, workedTime: 4.5, distance: 12.5, shiftCount: 1,
  platforms: {
    uber: { brutto: 10, orders: 1 }, wolt: { brutto: 20, orders: 2 }, bolt: { brutto: 30, orders: 3 }, glovo: { brutto: 40, orders: 4 }, stuart: { brutto: 50, orders: 5 }, other: { brutto: 60, orders: 6 },
  },
};

function renderStatistics() {
  return render(<ThemeProvider><StatisticsContent /></ThemeProvider>);
}

function withPlatforms(platforms: StatisticsMetrics['platforms']): StatisticsMetrics {
  return { ...metrics, platforms };
}

describe('StatisticsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocale = 'en';
    mockRetry.mockResolvedValue(undefined);
    mockStatisticsState = { status: 'ready', metrics };
    mockUseStatisticsMetrics.mockImplementation(() => mockStatisticsState);
  });

  test('renders a canonical Brutto-first summary, sections, and ordered platform rows', async () => {
    await renderStatistics();

    for (const label of ['Statistics', 'Total Brutto', 'Orders', 'Income composition', 'Base income', 'App tips', 'Cash tips', 'Bonuses', 'Work context', 'Worked time', 'Distance', 'Shift count', 'By platform']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByText(formatCurrency('en', 100))).toBeTruthy();
    expect(screen.getByText(formatNumber('en', 8, 0))).toBeTruthy();
    expect(screen.getByTestId('statistics-summary').props.accessibilityLabel).toBe('Total Brutto: ' + formatCurrency('en', 100) + '. Orders: ' + formatNumber('en', 8, 0));
    expect(screen.getByText('Statistics').props.accessibilityRole).toBe('header');
    expect(screen.getByText('Income composition').props.accessibilityRole).toBe('header');
    expect(screen.getByText('Work context').props.accessibilityRole).toBe('header');
    expect(screen.getByText('By platform').props.accessibilityRole).toBe('header');
    expect(screen.getAllByTestId(/statistics-platform-/).map((node) => node.props.testID)).toEqual([
      'statistics-platform-uber', 'statistics-platform-wolt', 'statistics-platform-bolt', 'statistics-platform-glovo', 'statistics-platform-stuart', 'statistics-platform-other',
    ]);
    expect(screen.getByTestId('statistics-platform-other').props.accessibilityLabel).toContain('work.platform.other');
    expect(within(screen.getByTestId('statistics-platform-uber')).queryByText('Worked time')).toBeNull();
    expect(within(screen.getByTestId('statistics-platform-uber')).queryByText('Distance')).toBeNull();
    expect(screen.queryByText(/chart|ranking|best platform|%/i)).toBeNull();
  });

  test('uses mocked canonical totals directly rather than deriving them from platform rows', async () => {
    mockStatisticsState = { status: 'ready', metrics: { ...metrics, totalBrutto: 987, orders: 654 } };
    await renderStatistics();

    expect(screen.getByText(formatCurrency('en', 987))).toBeTruthy();
    expect(screen.getByText(formatNumber('en', 654, 0))).toBeTruthy();
    expect(screen.getByText(formatCurrency('en', 10))).toBeTruthy();
  });

  test('hides zero-only platforms while preserving non-zero Brutto or orders rows and generic Other', async () => {
    mockStatisticsState = {
      status: 'ready',
      metrics: withPlatforms({
        uber: { brutto: 0, orders: 0 }, wolt: { brutto: 0, orders: 2 }, bolt: { brutto: 3, orders: 0 }, glovo: { brutto: 0, orders: 0 }, stuart: { brutto: 0, orders: 0 }, other: { brutto: 4, orders: 1 },
      }),
    };
    await renderStatistics();

    expect(screen.queryByTestId('statistics-platform-uber')).toBeNull();
    expect(screen.getAllByTestId(/statistics-platform-/).map((node) => node.props.testID)).toEqual(['statistics-platform-wolt', 'statistics-platform-bolt', 'statistics-platform-other']);
    expect(screen.getByText('work.platform.other')).toBeTruthy();
    expect(screen.queryByText('Private Other name')).toBeNull();
  });

  test('omits the platform section when every canonical platform is zero-only', async () => {
    const zeroPlatforms = { uber: { brutto: 0, orders: 0 }, wolt: { brutto: 0, orders: 0 }, bolt: { brutto: 0, orders: 0 }, glovo: { brutto: 0, orders: 0 }, stuart: { brutto: 0, orders: 0 }, other: { brutto: 0, orders: 0 } } as const;
    mockStatisticsState = { status: 'ready', metrics: withPlatforms(zeroPlatforms) };
    await renderStatistics();

    expect(screen.queryByText('By platform')).toBeNull();
    expect(screen.queryByTestId(/statistics-platform-/)).toBeNull();
  });

  test('keeps the Week default and delegates canonical period selection', async () => {
    await renderStatistics();

    expect(screen.getByTestId('statistics-period-week').props.accessibilityState).toEqual({ selected: true });
    for (const period of ['today', 'month', 'allTime'] as const) {
      await fireEvent.press(screen.getByTestId(`statistics-period-${period}`));
      expect(mockUseStatisticsMetrics).toHaveBeenLastCalledWith(period);
      expect(screen.getByTestId(`statistics-period-${period}`).props.accessibilityState).toEqual({ selected: true });
    }
  });

  test('updates typed labels and formatted values after a locale rerender', async () => {
    const view = await renderStatistics();
    expect(screen.getByText('Statistics')).toBeTruthy();

    mockLocale = 'pl';
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);

    expect(screen.getByText('Statystyki')).toBeTruthy();
    expect(screen.getByText('Struktura przychodu')).toBeTruthy();
    expect(screen.getByText(formatCurrency('pl', 100))).toBeTruthy();
  });

  test('has both new section keys in every supported dictionary', () => {
    for (const locale of ['pl', 'uk', 'en', 'ru'] as const) {
      expect(translations[locale]['statistics.section.incomeComposition']).toEqual(expect.any(String));
      expect(translations[locale]['statistics.section.workContext']).toEqual(expect.any(String));
    }
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
    expect(screen.getByText('Statistics')).toBeTruthy();
    expect(screen.getByText('statistics.periodEmpty.title')).toBeTruthy();
    expect(screen.getByTestId('statistics-period-allTime')).toBeTruthy();
    expect(screen.queryByTestId('statistics-summary')).toBeNull();

    mockStatisticsState = { status: 'recoverable_error', retry: mockRetry };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    await fireEvent.press(screen.getByTestId('statistics-retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);

    mockStatisticsState = { status: 'blocked', retry: mockRetry };
    await view.rerender(<ThemeProvider><StatisticsContent /></ThemeProvider>);
    expect(screen.getByText('statistics.blocked.title')).toBeTruthy();
    expect(screen.queryByText('permission denied')).toBeNull();
  });
});
