import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppStateSurface } from '@/components/ui/AppStateSurface';
import { AppText } from '@/components/ui/AppText';
import { darkTheme } from '@/theme/theme';
import { ThemeProvider } from '@/theme/ThemeProvider';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('Design foundation primitives', () => {
  test('renders non-pressable cards with current surface, elevation, padding, and passed View props', async () => {
    const view = await renderWithTheme(<AppCard accessibilityLabel="Card" testID="card"><AppText>Content</AppText></AppCard>);
    expect(StyleSheet.flatten(view.getByTestId('card').props.style)).toMatchObject({ backgroundColor: darkTheme.colors.surface, borderRadius: darkTheme.radii.md, padding: darkTheme.spacing.md });
    expect(view.getByTestId('card').props.onPress).toBeUndefined();

    await view.rerender(<ThemeProvider><AppCard padding="lg" testID="card" variant="elevated"><AppText>Content</AppText></AppCard></ThemeProvider>);
    expect(StyleSheet.flatten(view.getByTestId('card').props.style)).toMatchObject({ backgroundColor: darkTheme.colors.surfaceElevated, padding: darkTheme.spacing.lg });
  });

  test('renders metric strings without formatting them and supports explicit accessibility labels and children', async () => {
    await renderWithTheme(<AppMetricCard accessibilityLabel="Revenue: 0.50 PLN" label="Revenue" testID="metric" value="0.50 PLN"><AppText>Secondary</AppText></AppMetricCard>);
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('0.50 PLN')).toBeTruthy();
    expect(screen.getByText('Secondary')).toBeTruthy();
    expect(screen.getByTestId('metric').props.accessibilityLabel).toBe('Revenue: 0.50 PLN');
  });

  test('renders controlled localized segmented tabs and ignores disabled options', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<AppSegmentedControl accessibilityLabel="Period" onChange={onChange} options={[{ value: 'today', label: 'Today', testID: 'today' }, { value: 'week', label: 'Week', testID: 'week', disabled: true }]} value="today" />);
    expect(screen.getByTestId('today').props.accessibilityRole).toBe('tab');
    expect(screen.getByTestId('today').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('week').props.accessibilityState).toEqual({ selected: false, disabled: true });
    await fireEvent.press(screen.getByTestId('today'));
    await fireEvent.press(screen.getByTestId('week'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('today');
  });

  test('composes state content, action, disabled action, and optional loading without generic copy', async () => {
    const onPress = jest.fn();
    const view = await renderWithTheme(<AppStateSurface action={{ label: 'Retry', onPress, testID: 'retry' }} description="Description" loading title="Title"><AppText>Feature content</AppText></AppStateSurface>);
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Feature content')).toBeTruthy();
    expect(screen.getByTestId('app-state-loading')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('retry'));
    expect(onPress).toHaveBeenCalledTimes(1);

    await view.rerender(<ThemeProvider><AppStateSurface action={{ label: 'Retry', onPress, disabled: true, testID: 'retry' }} /></ThemeProvider>);
    expect(screen.getByTestId('retry').props.accessibilityState).toEqual({ disabled: true });
  });
});
