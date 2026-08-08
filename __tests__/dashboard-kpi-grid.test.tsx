import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { DashboardHeroCard } from '@/features/dashboard/components/DashboardHeroCard';
import { DashboardKpiGrid, resolveDashboardKpiGridColumns } from '@/features/dashboard/components/DashboardKpiGrid';
import { ThemeProvider } from '@/theme/ThemeProvider';

const items = [
  { key: 'hours', label: 'Total hours across the selected period', value: '123,456.78' },
  { key: 'kilometers', label: 'Total kilometers', value: '20' },
  { key: 'orders', label: 'Total orders', value: '12' },
  { key: 'shifts', label: 'Total shifts', value: '2' },
] as const;

describe('Dashboard presentation components', () => {
  test('uses two columns only when the content width and font scale can accommodate them', () => {
    expect(resolveDashboardKpiGridColumns(312, 1, 12)).toBe(2);
    expect(resolveDashboardKpiGridColumns(272, 1, 12)).toBe(1);
    expect(resolveDashboardKpiGridColumns(400, 1.2, 12)).toBe(1);
  });

  test('renders supplied KPI strings in order without adding interactive behavior', async () => {
    await render(<ThemeProvider><DashboardKpiGrid items={items} /></ThemeProvider>);

    expect(screen.getByTestId('dashboard-kpi-grid')).toBeTruthy();
    for (const item of items) {
      expect(screen.getByTestId(`dashboard-kpi-${item.key}`)).toBeTruthy();
      expect(screen.getByText(item.label)).toBeTruthy();
      expect(screen.getByText(item.value)).toBeTruthy();
      expect(screen.getByTestId(`dashboard-kpi-${item.key}`).props.onPress).toBeUndefined();
    }
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-kpi-grid').props.style)).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap' });
  });

  test('makes the supplied Brutto value visually primary without introducing interaction', async () => {
    await render(<ThemeProvider><DashboardHeroCard label="Total Brutto" unit="PLN" value="12,345.67" /></ThemeProvider>);

    expect(screen.getByText('Total Brutto')).toBeTruthy();
    expect(screen.getByText('PLN')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText('12,345.67').props.style)).toMatchObject({ fontSize: 34, lineHeight: 40 });
    expect(screen.getByText('12,345.67').parent?.parent?.props.onPress).toBeUndefined();
  });
});
