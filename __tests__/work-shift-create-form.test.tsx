import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import type { WorkShiftCreateContextValue } from '@/features/work/provider/workShiftCreateContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { darkTheme } from '@/theme/theme';

const mockSubmit = jest.fn<WorkShiftCreateContextValue['submit']>();
const mockReconcile = jest.fn<WorkShiftCreateContextValue['reconcile']>();
const mockReset = jest.fn<WorkShiftCreateContextValue['reset']>();
let mockCreateState: WorkShiftCreateContextValue;

jest.mock('@/features/work/hooks/useWorkShiftCreate', () => ({ useWorkShiftCreate: () => mockCreateState }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('@react-native-community/datetimepicker', () => ({ __esModule: true, default: () => null }));

const { WorkShiftCreateForm } = require('@/features/work/components/WorkShiftCreateForm') as typeof import('@/features/work/components/WorkShiftCreateForm');

function state(status: WorkShiftCreateContextValue['status']): WorkShiftCreateContextValue {
  return { status, submit: mockSubmit, reconcile: mockReconcile, reset: mockReset, subjectUserId: 'user-a' } as WorkShiftCreateContextValue;
}

async function renderForm(onCancel = jest.fn()) {
  return { onCancel, ...(await render(<ThemeProvider><WorkShiftCreateForm onCancel={onCancel} /></ThemeProvider>)) };
}

describe('WorkShiftCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 29, 12));
    mockCreateState = state('idle');
    mockSubmit.mockResolvedValue(undefined);
    mockReconcile.mockResolvedValue(undefined);
  });

  afterEach(() => { cleanup(); jest.useRealTimers(); });

  test('renders required fields and all six verified platforms', async () => {
    const view = await renderForm();
    expect(view.getByText('work.create.title').props.accessibilityRole).toBe('header');
    expect(view.getByTestId('work-create-general')).toBeTruthy();
    expect(view.getByTestId('work-create-platforms')).toBeTruthy();
    expect(view.getByTestId('work-create-date').props.accessibilityRole).toBe('button');
    expect(view.getByTestId('work-create-date').props.onChangeText).toBeUndefined();
    expect(view.getByTestId('work-create-km')).toBeTruthy();
    expect(view.getByTestId('work-create-hours')).toBeTruthy();
    for (const platform of ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other']) expect(view.getByTestId(`work-platform-${platform}`)).toBeTruthy();
  });

  test('uses selectable platform controls and keeps deselected draft metrics out of the Create payload', async () => {
    const view = await renderForm();
    const uber = view.getByTestId('work-platform-uber');
    expect(uber.props.accessibilityState).toEqual({ disabled: false, selected: false });

    await act(async () => { fireEvent.press(uber); });
    expect(view.getByTestId('work-platform-uber').props.accessibilityState).toEqual({ disabled: false, selected: true });
    expect(view.getByTestId('work-create-platform-card-uber')).toBeTruthy();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-income'), '42'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    expect(view.queryByTestId('work-create-platform-card-uber')).toBeNull();
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-wolt')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-submit')); });

    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ platforms: expect.objectContaining({ uber: expect.objectContaining({ enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }) }) }));
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    expect(view.getByTestId('work-uber-income').props.value).toBe('42');
  });

  test('keeps Other name before its metric fields and actions after selected platform cards', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-other')); });

    const tree = JSON.stringify(view.toJSON());
    expect(tree.indexOf('work-create-general')).toBeLessThan(tree.indexOf('work-create-platforms'));
    expect(tree.indexOf('work-create-date')).toBeLessThan(tree.indexOf('work-create-km'));
    expect(tree.indexOf('work-create-km')).toBeLessThan(tree.indexOf('work-create-hours'));
    expect(tree.indexOf('work-other-name')).toBeLessThan(tree.indexOf('work-other-income'));
    expect(tree.indexOf('work-create-platform-card-other')).toBeLessThan(tree.indexOf('work-create-form-actions'));
  });

  test('submits native decimal text as finite numeric input', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-date'), '2026-07-29'); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-km'), '12,5'); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-hours'), '8.25'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-income'), '100,5'); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-orders'), '3'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-platform-card-uber-details-toggle')); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-appTips'), '4.25'); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-cashTips'), '5,75'); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-bonuses'), '6'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-submit')); });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: '2026-07-29', km: 12.5, hours: 8.25, platforms: expect.objectContaining({ uber: expect.objectContaining({ enabled: true, income: 100.5, orders: 3, appTips: 4.25, cashTips: 5.75, bonuses: 6 }) }) }));
  });

  test('keeps cleared numeric fields as empty text and never renders NaN', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-km'), ''); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-hours'), ''); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-platform-card-uber-details-toggle')); });
    for (const metric of ['income', 'orders', 'appTips', 'cashTips', 'bonuses']) await act(async () => { fireEvent.changeText(view.getByTestId(`work-uber-${metric}`), ''); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-submit')); });
    for (const testId of ['work-create-km', 'work-create-hours', 'work-uber-income', 'work-uber-orders', 'work-uber-appTips', 'work-uber-cashTips', 'work-uber-bonuses']) {
      expect(view.getByTestId(testId).props.value).toBe('');
      expect(view.getByTestId(testId).props.value).not.toBe('NaN');
    }
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(view.getByText('work.create.validation')).toBeTruthy();
    expect(view.getByText('work.create.validation.number')).toBeTruthy();
  });

  test('shows safe reconciliation UI and does not offer another insert', async () => {
    mockCreateState = state('reconciliation_required');
    const view = await renderForm();
    expect(view.getByText('work.create.reconciliation')).toBeTruthy();
    expect(view.queryByTestId('work-create-submit')).toBeNull();
    await act(async () => { fireEvent.press(view.getByTestId('work-create-reconcile')); });
    expect(mockReconcile).toHaveBeenCalledTimes(1);
  });

  test('disables submit and cancel while pending', async () => {
    mockCreateState = state('submitting');
    const view = await renderForm();
    expect(view.getByTestId('work-create-submit').props.accessibilityState).toMatchObject({ disabled: true, busy: true });
    expect(view.getByTestId('work-create-cancel').props.accessibilityState).toEqual({ disabled: true });
  });

  test('clears terminal success before returning to Work so a later Create route starts clean', async () => {
    mockCreateState = state('success');
    const { onCancel } = await renderForm();

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('resets deterministically on an available cancel action', async () => {
    const { onCancel, ...view } = await renderForm();
    await act(async () => { fireEvent.press(view.getByTestId('work-create-cancel')); });
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('keeps optional values when disclosure collapses and exposes an accessible per-platform remove action', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-wolt')); });

    const uberToggle = view.getByTestId('work-create-platform-card-uber-details-toggle');
    expect(uberToggle.props.accessibilityState).toEqual({ expanded: false });
    await act(async () => { fireEvent.press(uberToggle); });
    expect(view.getByTestId('work-create-platform-card-uber-details-toggle').props.accessibilityState).toEqual({ expanded: true });
    expect(view.queryByTestId('work-wolt-appTips')).toBeNull();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-uber-appTips'), '5'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-platform-card-uber-details-toggle')); });
    expect(view.queryByTestId('work-uber-appTips')).toBeNull();
    await act(async () => { fireEvent.press(view.getByTestId('work-create-platform-card-uber-details-toggle')); });
    expect(view.getByTestId('work-uber-appTips').props.value).toBe('5');

    const remove = view.getByTestId('work-create-platform-card-uber-remove');
    expect(remove.props.accessibilityLabel).toContain('work.platform.uber');
    await act(async () => { fireEvent.press(remove); });
    expect(view.queryByTestId('work-create-platform-card-uber')).toBeNull();
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    expect(view.getByTestId('work-uber-appTips').props.value).toBe('5');
  });

  test('uses a positive Create action without changing the secondary Cancel action', async () => {
    const view = await renderForm();
    expect(StyleSheet.flatten(view.getByTestId('work-create-submit').props.style)).toMatchObject({ backgroundColor: darkTheme.colors.positive });
    expect(StyleSheet.flatten(view.getByTestId('work-create-cancel').props.style).backgroundColor).not.toBe(darkTheme.colors.positive);
  });
});
