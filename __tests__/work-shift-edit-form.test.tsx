import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';

import { validateWorkShiftEdit } from '@/features/work/domain/workShiftEditValidation';
import type { WorkShiftEditContextValue } from '@/features/work/provider/workShiftEditContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockSubmit = jest.fn<WorkShiftEditContextValue['submit']>();
let mockEditState: WorkShiftEditContextValue;

jest.mock('@/features/work/hooks/useWorkShiftEdit', () => ({ useWorkShiftEdit: () => mockEditState }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: ({ onChange, testID }: { onChange: (event: { type: 'set' }, value: Date) => void; testID: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `${testID}-set`, onPress: () => onChange({ type: 'set' }, new Date(2024, 1, 29, 12)) }, 'set');
  },
}));

const { WorkShiftEditForm } = require('@/features/work/components/WorkShiftEditForm') as typeof import('@/features/work/components/WorkShiftEditForm');

function readyState(): WorkShiftEditContextValue {
  const input = { date: '2026-07-29', km: 0, hours: 0, platforms: { uber: { enabled: true, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, wolt: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null } } };
  return { status: 'ready', shift: { id: 1, ...input }, input, submit: mockSubmit, load: jest.fn(), reconcile: jest.fn(), reset: jest.fn(), subjectUserId: 'user-a' } as WorkShiftEditContextValue;
}

function terminalState(status: 'loading' | 'recoverable_error' | 'blocked' | 'not_found'): WorkShiftEditContextValue {
  return { status, submit: mockSubmit, load: jest.fn(), reconcile: jest.fn(), reset: jest.fn(), subjectUserId: 'user-a' } as WorkShiftEditContextValue;
}

describe('WorkShiftEditForm', () => {
  beforeEach(() => { jest.clearAllMocks(); mockSubmit.mockResolvedValue(undefined); mockEditState = readyState(); });

  test('initializes from the canonical edit date and submits the selected canonical date', async () => {
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);
    expect(view.getByTestId('work-edit-date').props.accessibilityLabel).toContain('2026');
    expect(view.getByTestId('work-edit-date').props.onChangeText).toBeUndefined();
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-date')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-date-picker-set')); });
    const confirm = view.queryByTestId('work-edit-date-confirm');
    if (confirm !== null) await act(async () => { fireEvent.press(confirm); });
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-submit')); });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: '2024-02-29' }));
  });

  test('renders cleared root and platform numeric fields as empty while preserving invalid NaN state', async () => {
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);

    await act(async () => { fireEvent.changeText(view.getByTestId('work-edit-km'), ''); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-edit-hours'), ''); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-edit-uber-income'), ''); });

    expect(view.getByTestId('work-edit-km').props.value).toBe('');
    expect(view.getByTestId('work-edit-hours').props.value).toBe('');
    expect(view.getByTestId('work-edit-uber-income').props.value).toBe('');
    expect(view.queryByDisplayValue('NaN')).toBeNull();

    await act(async () => { fireEvent.press(view.getByTestId('work-edit-submit')); });
    const submitted = mockSubmit.mock.calls[0]?.[0];
    expect(submitted).toBeDefined();
    expect(Number.isNaN(submitted!.km)).toBe(true);
    expect(Number.isNaN(submitted!.hours)).toBe(true);
    expect(Number.isNaN(submitted!.platforms.uber.income)).toBe(true);
    expect(validateWorkShiftEdit(submitted!)).toEqual({ isValid: false, error: 'invalid_number' });
  });

  test('keeps zero as zero and untouched nullable platform values as empty inputs', async () => {
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);

    expect(view.getByTestId('work-edit-km').props.value).toBe('0');
    expect(view.getByTestId('work-edit-hours').props.value).toBe('0');
    expect(view.getByTestId('work-edit-uber-income').props.value).toBe('0');
    expect(view.getByTestId('work-edit-uber-orders').props.value).toBe('');
    expect(view.getByTestId('work-edit-uber-appTips').props.value).toBe('');
    expect(view.getByTestId('work-edit-uber-bonuses').props.value).toBe('');

    await act(async () => { fireEvent.press(view.getByTestId('work-edit-submit')); });
    const submitted = mockSubmit.mock.calls[0]?.[0];
    expect(submitted?.platforms.uber.orders).toBeNull();
    expect(submitted?.platforms.uber.appTips).toBeNull();
    expect(submitted?.platforms.uber.bonuses).toBeNull();
  });

  test('uses selected controls and preserves hidden Edit values after deselection', async () => {
    const editableState = readyState();
    if (!('input' in editableState)) throw new Error('ready state expected');
    editableState.input.platforms.wolt = { enabled: true, income: 6, orders: 7, appTips: 8, cashTips: 9, bonuses: 10 };
    mockEditState = editableState;
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);

    expect(view.getByTestId('work-edit-platform-wolt').props.accessibilityState).toEqual({ disabled: false, selected: true });
    expect(view.getByTestId('work-edit-platform-card-wolt')).toBeTruthy();
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-platform-wolt')); });
    expect(view.getByTestId('work-edit-platform-wolt').props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(view.queryByTestId('work-edit-platform-card-wolt')).toBeNull();
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-submit')); });

    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ platforms: expect.objectContaining({ wolt: { enabled: false, income: 6, orders: 7, appTips: 8, cashTips: 9, bonuses: 10 } }) }));
  });

  test('renders general fields before the platform selector and actions after platform cards', async () => {
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);
    const tree = JSON.stringify(view.toJSON());

    expect(tree.indexOf('work-edit-general')).toBeLessThan(tree.indexOf('work-edit-platforms'));
    expect(tree.indexOf('work-edit-date')).toBeLessThan(tree.indexOf('work-edit-hours'));
    expect(tree.indexOf('work-edit-hours')).toBeLessThan(tree.indexOf('work-edit-km'));
    expect(tree.indexOf('work-edit-platform-card-uber')).toBeLessThan(tree.indexOf('work-edit-form-actions'));
  });

  test.each([
    ['loading', 'work.edit.loading'],
    ['not_found', 'work.edit.notFound'],
    ['recoverable_error', 'work.edit.recoverable'],
    ['blocked', 'work.edit.blocked'],
  ])('renders the safe %s full-screen state', async (status, message) => {
    mockEditState = terminalState(status as 'loading' | 'recoverable_error' | 'blocked' | 'not_found');
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);

    expect(view.getByText(message)).toBeTruthy();
  });
});
