import { describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: ({ onChange, testID }: { onChange: (event: { type: 'set' | 'dismissed' }, value?: Date) => void; testID: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(React.Fragment, null,
      React.createElement(Text, { testID: `${testID}-set`, onPress: () => onChange({ type: 'set' }, new Date(2024, 1, 29, 12)) }, 'set'),
      React.createElement(Text, { testID: `${testID}-dismiss`, onPress: () => onChange({ type: 'dismissed' }) }, 'dismiss'),
    );
  },
}));

const { WorkShiftDateField } = require('@/features/work/components/WorkShiftDateField') as typeof import('@/features/work/components/WorkShiftDateField');

describe('WorkShiftDateField', () => {
  test('opens the native picker and commits the selected local calendar date', async () => {
    const onChange = jest.fn();
    const view = await render(<ThemeProvider><WorkShiftDateField label="Date" onChange={onChange} testID="date" value="2026-01-05" /></ThemeProvider>);
    await act(async () => { fireEvent.press(view.getByTestId('date')); });
    expect(view.getByTestId('date-picker-set')).toBeTruthy();
    await act(async () => { fireEvent.press(view.getByTestId('date-picker-set')); });
    const confirm = view.queryByTestId('date-confirm');
    if (confirm !== null) await act(async () => { fireEvent.press(confirm); });
    expect(onChange).toHaveBeenCalledWith('2024-02-29');
  });

  test('keeps the previous date when the native picker is dismissed or canceled', async () => {
    const onChange = jest.fn();
    const view = await render(<ThemeProvider><WorkShiftDateField label="Date" onChange={onChange} testID="date" value="2026-12-31" /></ThemeProvider>);
    await act(async () => { fireEvent.press(view.getByTestId('date')); });
    await act(async () => { fireEvent.press(view.getByTestId('date-picker-dismiss')); });
    const cancel = view.queryByTestId('date-cancel');
    if (cancel !== null) await act(async () => { fireEvent.press(cancel); });
    expect(onChange).not.toHaveBeenCalled();
  });

  test('does not make malformed canonical input editable', async () => {
    const view = await render(<ThemeProvider><WorkShiftDateField label="Date" onChange={jest.fn()} testID="date" value="2026-02-30" /></ThemeProvider>);
    expect(view.getByTestId('date').props.accessibilityState).toEqual({ disabled: true });
    expect(view.getByTestId('date').props.onChangeText).toBeUndefined();
  });
});
