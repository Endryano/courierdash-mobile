import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { DashboardHeroCard } from '@/features/dashboard/components/DashboardHeroCard';
import { DashboardMetricStrip } from '@/features/dashboard/components/DashboardMetricStrip';
import { DashboardRecordGrid } from '@/features/dashboard/components/DashboardRecordGrid';
import { ThemeProvider } from '@/theme/ThemeProvider';

describe('Dashboard metric presentation', () => {
  test('groups supplied operational values in one non-interactive four-column strip', async () => {
    await render(
      <ThemeProvider>
        <DashboardMetricStrip
          items={[
            { accentColor: '#00e5ff', icon: 'receipt-outline', key: 'orders', label: 'Orders', value: '12' },
            { accentColor: '#00b844', icon: 'time-outline', key: 'hours', label: 'Hours', value: '8' },
            { accentColor: '#d88b00', icon: 'navigate-outline', key: 'kilometers', label: 'Km', value: '20' },
            { accentColor: '#ffffff', icon: 'repeat-outline', key: 'shifts', label: 'Shifts', value: '2' },
          ]}
          testID="operational"
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('operational')).toBeTruthy();
    for (const key of ['orders', 'hours', 'kilometers', 'shifts']) {
      expect(screen.getByTestId(`operational-${key}`).props.onPress).toBeUndefined();
    }
    expect(StyleSheet.flatten(screen.getByTestId('operational').props.style)).toMatchObject({ flexDirection: 'row' });
  });

  test('keeps the supplied Brutto value visually dominant without interaction', async () => {
    await render(<ThemeProvider><DashboardHeroCard label="Total Brutto" unit="PLN" value="12,345.67" /></ThemeProvider>);

    expect(screen.getByText('Total Brutto')).toBeTruthy();
    expect(screen.getByText('PLN')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText('12,345.67').props.style)).toMatchObject({ fontSize: 38, lineHeight: 44 });
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-hero-value-row').props.style)).toMatchObject({ justifyContent: 'center', width: '100%' });
    expect(StyleSheet.flatten(screen.getByText('12,345.67').props.style)).toMatchObject({ flexShrink: 1, textAlign: 'right' });
    expect(screen.getByText('12,345.67').parent?.parent?.props.onPress).toBeUndefined();
  });

  test.each(['2 944,00', '12 540,00', '123 456,78'])('keeps realistic total-income values in the same inline row: %s', async (value) => {
    await render(<ThemeProvider><DashboardHeroCard label="Total Brutto" unit="PLN" value={value} /></ThemeProvider>);

    expect(screen.getByText(value)).toBeTruthy();
    expect(screen.getByText('PLN')).toBeTruthy();
  });

  test('renders compact record cards with a supplied localized date', async () => {
    await render(
      <ThemeProvider>
        <DashboardRecordGrid items={[{ date: 'August 1, 2026', icon: 'trophy-outline', key: 'income', label: 'Highest income', unit: 'PLN', value: '360.00' }]} />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('dashboard-record-income')).toBeTruthy();
    expect(screen.getByText('August 1, 2026')).toBeTruthy();
    expect(screen.getByTestId('dashboard-record-income').props.onPress).toBeUndefined();
  });
});
