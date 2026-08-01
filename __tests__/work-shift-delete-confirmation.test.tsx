import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import type { WorkShiftDeleteContextValue } from '@/features/work/provider/workShiftDeleteContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockBackHandlerAddEventListener = jest.fn();
const mockBackHandlerRemove = jest.fn();
const mockCancelDelete = jest.fn();
const mockConfirmDelete = jest.fn<() => Promise<void>>();
const mockReconcile = jest.fn<() => Promise<void>>();
const mockReset = jest.fn();

let hardwareBackHandler: (() => boolean) | undefined;
let mockDeletion: WorkShiftDeleteContextValue;

jest.mock('@/features/work/hooks/useWorkShiftDelete', () => ({
  useWorkShiftDelete: () => mockDeletion,
}));

jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({ locale: 'en', t: (key: string) => key }),
}));

const { WorkShiftDeleteConfirmation } = require('@/features/work/components/WorkShiftDeleteConfirmation') as typeof import('@/features/work/components/WorkShiftDeleteConfirmation');

const summary = { id: 42, date: '2026-07-29', hours: 8.5, km: 21.25 };

function deletionState(status: WorkShiftDeleteContextValue['status']): WorkShiftDeleteContextValue {
  if (status === 'idle') {
    return { status, requestDelete: jest.fn(), cancelDelete: mockCancelDelete, confirmDelete: mockConfirmDelete, reconcile: mockReconcile, reset: mockReset, subjectUserId: 'user-a' };
  }

  return { status, summary, requestDelete: jest.fn(), cancelDelete: mockCancelDelete, confirmDelete: mockConfirmDelete, reconcile: mockReconcile, reset: mockReset, subjectUserId: 'user-a' } as WorkShiftDeleteContextValue;
}

function renderConfirmation() {
  return render(<ThemeProvider><WorkShiftDeleteConfirmation /></ThemeProvider>);
}

describe('WorkShiftDeleteConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirmDelete.mockResolvedValue(undefined);
    mockReconcile.mockResolvedValue(undefined);
    mockDeletion = deletionState('confirming');
    hardwareBackHandler = undefined;
    mockBackHandlerAddEventListener.mockImplementation((...args: unknown[]) => {
      const handler = args[1] as () => boolean;
      hardwareBackHandler = handler;
      return { remove: mockBackHandlerRemove };
    });
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation(mockBackHandlerAddEventListener as typeof BackHandler.addEventListener);
  });

  test('renders only the localized safe summary and separate explicit confirmation actions', async () => {
    await renderConfirmation();

    expect(screen.getByText('work.delete.title')).toBeTruthy();
    expect(screen.getByText('work.delete.body')).toBeTruthy();
    expect(screen.getByText('July 29, 2026')).toBeTruthy();
    expect(screen.getByText('8.5')).toBeTruthy();
    expect(screen.getByText('21.25')).toBeTruthy();
    expect(screen.queryByText('42')).toBeNull();
    expect(screen.queryByText(/PLN|income|tips|bonuses|orders/i)).toBeNull();
    expect(screen.getByTestId('work-delete-confirmation-card').props.onPress).toBeUndefined();
    expect(screen.getByTestId('work-delete-confirm').props.accessibilityLabel).toBe('work.delete.confirm');
    expect(screen.getByTestId('work-delete-cancel').props.accessibilityLabel).toBe('work.delete.cancel');

    await fireEvent.press(screen.getByTestId('work-delete-confirm'));
    await fireEvent.press(screen.getByTestId('work-delete-cancel'));
    expect(mockConfirmDelete).toHaveBeenCalledTimes(1);
    expect(mockCancelDelete).toHaveBeenCalledTimes(1);
  });

  test('keeps deletion pending on screen and consumes Android Back without another action', async () => {
    mockDeletion = deletionState('deleting');
    await renderConfirmation();

    const confirm = screen.getByTestId('work-delete-confirm');
    expect(confirm.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(screen.getByTestId('work-delete-cancel').props.accessibilityState).toEqual({ disabled: true });
    await fireEvent.press(confirm);
    expect(mockConfirmDelete).not.toHaveBeenCalled();
    expect(hardwareBackHandler?.()).toBe(true);
    expect(mockCancelDelete).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });

  test.each([
    ['recoverable_error', 'work.delete.recoverableTitle', 'work.delete.recoverable'],
    ['blocked', 'work.delete.blockedTitle', 'work.delete.blocked'],
  ] as [WorkShiftDeleteContextValue['status'], string, string][])('renders %s as a return-only state and resets through Android Back', async (status, title, body) => {
    mockDeletion = deletionState(status);
    await renderConfirmation();

    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
    expect(screen.getByTestId('work-delete-cancel').props.accessibilityLabel).toBe('work.delete.return');
    expect(screen.queryByTestId('work-delete-confirm')).toBeNull();
    expect(screen.queryByText(/retry/i)).toBeNull();
    expect(hardwareBackHandler?.()).toBe(true);
    expect(mockReset).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId('work-delete-cancel'));
    expect(mockReset).toHaveBeenCalledTimes(2);
  });

  test('keeps reconciliation refresh-only and consumes Back while its pending state is shown', async () => {
    mockDeletion = deletionState('reconciliation_required');
    const view = await renderConfirmation();

    expect(screen.getByText('work.delete.reconciliationTitle')).toBeTruthy();
    expect(screen.getByTestId('work-delete-reconcile')).toBeTruthy();
    expect(screen.queryByTestId('work-delete-confirm')).toBeNull();
    await fireEvent.press(screen.getByTestId('work-delete-reconcile'));
    expect(mockReconcile).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('work-delete-cancel'));
    expect(mockReset).toHaveBeenCalledTimes(1);

    mockDeletion = deletionState('deleting');
    await view.rerender(<ThemeProvider><WorkShiftDeleteConfirmation /></ThemeProvider>);
    expect(screen.getByTestId('work-delete-cancel').props.accessibilityState).toEqual({ disabled: true });
    expect(hardwareBackHandler?.()).toBe(true);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  test('registers one Back listener and removes it when the confirmation unmounts', async () => {
    const view = await renderConfirmation();
    expect(mockBackHandlerAddEventListener).toHaveBeenCalledTimes(1);

    await act(async () => { view.unmount(); });
    expect(mockBackHandlerRemove).toHaveBeenCalledTimes(1);
  });
});
