import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';

import type { WorkShiftCreateContextValue } from '@/features/work/provider/workShiftCreateContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockSubmit = jest.fn<WorkShiftCreateContextValue['submit']>();
const mockReconcile = jest.fn<WorkShiftCreateContextValue['reconcile']>();
const mockReset = jest.fn<WorkShiftCreateContextValue['reset']>();
let mockCreateState: WorkShiftCreateContextValue;

jest.mock('@/features/work/hooks/useWorkShiftCreate', () => ({ useWorkShiftCreate: () => mockCreateState }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));

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
    mockCreateState = state('idle');
    mockSubmit.mockResolvedValue(undefined);
    mockReconcile.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  test('renders required fields and all six verified platforms', async () => {
    const view = await renderForm();
    expect(view.getByTestId('work-create-date')).toBeTruthy();
    expect(view.getByTestId('work-create-km')).toBeTruthy();
    expect(view.getByTestId('work-create-hours')).toBeTruthy();
    for (const platform of ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other']) expect(view.getByTestId(`work-platform-${platform}`)).toBeTruthy();
  });

  test('submits typed form input and keeps zero metrics representable', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-date'), '2026-07-29'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-submit')); });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: '2026-07-29', km: 0, hours: 0, platforms: expect.objectContaining({ uber: expect.objectContaining({ enabled: true, income: 0 }) }) }));
  });

  test('uses NaN for an empty numeric field instead of silently changing it to zero', async () => {
    const view = await renderForm();
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-km'), ''); });
    await act(async () => { fireEvent.changeText(view.getByTestId('work-create-date'), '2026-07-29'); });
    await act(async () => { fireEvent.press(view.getByTestId('work-platform-uber')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-create-submit')); });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ km: Number.NaN }));
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
    expect(view.getByTestId('work-create-submit').props.accessibilityState).toEqual({ disabled: true });
    expect(view.getByTestId('work-create-cancel').props.accessibilityState).toEqual({ disabled: true });
  });

  test('resets deterministically on an available cancel action', async () => {
    const { onCancel, ...view } = await renderForm();
    await act(async () => { fireEvent.press(view.getByTestId('work-create-cancel')); });
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
