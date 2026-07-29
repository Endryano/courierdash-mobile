import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { AuthState } from '@/features/auth/authTypes';
import type { WorkShift } from '@/features/work/domain/workShift';

let mockAuth: AuthState;
const mockGetOwnWorkShifts = jest.fn<(userId: string) => Promise<readonly WorkShift[]>>();

class MockWorkShiftsApiError extends Error {
  constructor(readonly category: 'network_unavailable' | 'forbidden' | 'unknown') {
    super('Work shifts request failed.');
  }
}

jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('@/features/work/api/workShiftsApi', () => ({ WorkShiftsApiError: MockWorkShiftsApiError, getOwnWorkShifts: mockGetOwnWorkShifts }));

const { WorkShiftsProvider } = require('@/features/work/provider/WorkShiftsProvider') as typeof import('@/features/work/provider/WorkShiftsProvider');
const { useWorkShifts } = require('@/features/work/hooks/useWorkShifts') as typeof import('@/features/work/hooks/useWorkShifts');

function authenticatedState(id: string): AuthState {
  const user = { id, user_metadata: {} } as AuthState['user'];
  return { status: 'authenticated', isAuthenticated: true, user, session: { user } as AuthState['session'] };
}

function Probe() {
  const { retry, shifts, status } = useWorkShifts();
  return <Text onPress={retry}>{`${status}:${shifts.length}`}</Text>;
}

describe('WorkShiftsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { status: 'unauthenticated', isAuthenticated: false, session: null, user: null };
    mockGetOwnWorkShifts.mockResolvedValue([]);
  });

  test('stays idle without an authenticated user', async () => {
    await render(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);

    expect(screen.getByText('idle:0')).toBeTruthy();
    expect(mockGetOwnWorkShifts).not.toHaveBeenCalled();
  });

  test('exposes empty and ready results only for the current owner', async () => {
    mockAuth = authenticatedState('user-1');
    const view = await render(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    expect(await screen.findByText('empty:0')).toBeTruthy();
    expect(mockGetOwnWorkShifts).toHaveBeenCalledWith('user-1');

    mockGetOwnWorkShifts.mockResolvedValue([{ id: 1, date: '2026-07-29', hours: 8, km: 20 }]);
    await act(async () => { screen.getByText('empty:0').props.onPress(); });
    expect(await screen.findByText('ready:1')).toBeTruthy();
    await view.unmount();
  });

  test('maps recoverable and blocked failures safely and prevents a duplicate pending retry', async () => {
    mockAuth = authenticatedState('user-1');
    mockGetOwnWorkShifts.mockRejectedValue(new MockWorkShiftsApiError('network_unavailable'));
    const view = await render(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    expect(await screen.findByText('recoverable_error:0')).toBeTruthy();

    let rejectRetry: ((reason?: unknown) => void) | undefined;
    mockGetOwnWorkShifts.mockImplementationOnce(() => new Promise((_, reject) => { rejectRetry = reject; }));
    const retryControl = screen.getByText('recoverable_error:0');
    await act(async () => {
      await retryControl.props.onPress();
      await retryControl.props.onPress();
    });
    await waitFor(() => expect(mockGetOwnWorkShifts).toHaveBeenCalledTimes(2));

    await act(async () => { rejectRetry?.(new MockWorkShiftsApiError('forbidden')); });
    expect(await screen.findByText('blocked:0')).toBeTruthy();
    await view.unmount();
  });

  test('invalidates a previous owner result during a user switch', async () => {
    let resolveFirst: ((value: readonly WorkShift[]) => void) | undefined;
    mockAuth = authenticatedState('user-a');
    mockGetOwnWorkShifts.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    mockGetOwnWorkShifts.mockResolvedValueOnce([]);
    const view = await render(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    await waitFor(() => expect(mockGetOwnWorkShifts).toHaveBeenCalledTimes(1));

    mockAuth = authenticatedState('user-b');
    await view.rerender(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    expect(await screen.findByText('empty:0')).toBeTruthy();

    await act(async () => { resolveFirst?.([{ id: 1, date: '2026-07-29', hours: 8, km: 20 }]); });
    expect(screen.getByText('empty:0')).toBeTruthy();
    expect(screen.queryByText('ready:1')).toBeNull();
  });

  test('ignores a stale failure after logout', async () => {
    let rejectRequest: ((reason?: unknown) => void) | undefined;
    mockAuth = authenticatedState('user-a');
    mockGetOwnWorkShifts.mockImplementationOnce(() => new Promise((_, reject) => { rejectRequest = reject; }));
    const view = await render(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    await waitFor(() => expect(mockGetOwnWorkShifts).toHaveBeenCalledTimes(1));

    mockAuth = { status: 'unauthenticated', isAuthenticated: false, session: null, user: null };
    await view.rerender(<WorkShiftsProvider><Probe /></WorkShiftsProvider>);
    expect(await screen.findByText('idle:0')).toBeTruthy();

    await act(async () => { rejectRequest?.(new MockWorkShiftsApiError('forbidden')); });
    expect(screen.getByText('idle:0')).toBeTruthy();
    expect(screen.queryByText('blocked:0')).toBeNull();
  });
});
