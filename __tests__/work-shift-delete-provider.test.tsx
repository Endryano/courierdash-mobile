import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { AuthState } from '@/features/auth/authTypes';

let mockAuth: AuthState;
const mockDelete = jest.fn<any>();
const mockRefresh = jest.fn<any>();

jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => ({ retry: mockRefresh }) }));
jest.mock('@/features/work/api/workShiftMutationsApi', () => ({
  deleteOwnWorkShift: mockDelete,
  WorkShiftDeleteError: class extends Error {
    category: string;
    constructor(category: string) {
      super('safe delete error');
      this.category = category;
    }
  },
}));

const { WorkShiftDeleteProvider } = require('@/features/work/provider/WorkShiftDeleteProvider') as typeof import('@/features/work/provider/WorkShiftDeleteProvider');
const { useWorkShiftDelete } = require('@/features/work/hooks/useWorkShiftDelete') as typeof import('@/features/work/hooks/useWorkShiftDelete');

function Probe() {
  const deletion = useWorkShiftDelete();
  const summary = 'summary' in deletion ? deletion.summary : undefined;
  return <>
    <Text testID="state">{`${deletion.status}:${summary?.id ?? 'none'}`}</Text>
    <Text testID="request-a" onPress={() => deletion.requestDelete({ id: 1, date: '2026-07-29', hours: 8, km: 1 })}>request A</Text>
    <Text testID="request-b" onPress={() => deletion.requestDelete({ id: 2, date: '2026-07-30', hours: 7, km: 2 })}>request B</Text>
    <Text testID="confirm" onPress={() => void deletion.confirmDelete()}>confirm</Text>
    <Text testID="cancel" onPress={deletion.cancelDelete}>cancel</Text>
    <Text testID="reconcile" onPress={() => void deletion.reconcile()}>reconcile</Text>
    <Text testID="reset" onPress={deletion.reset}>reset</Text>
  </>;
}

function authenticated(userId = 'user-a'): AuthState {
  const user = { id: userId } as AuthState['user'];
  return { status: 'authenticated', isAuthenticated: true, user, session: { user } as AuthState['session'] };
}

function signedOut(): AuthState {
  return { status: 'unauthenticated', isAuthenticated: false, user: null, session: null };
}

describe('WorkShiftDeleteProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = authenticated();
    mockDelete.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);
  });

  test('requires confirmation, supports cancellation, and owns a copied target', async () => {
    await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    expect(await screen.findByText('confirming:1')).toBeTruthy();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    await act(async () => { screen.getByTestId('cancel').props.onPress(); });
    expect(await screen.findByText('idle:none')).toBeTruthy();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('deletes once, refreshes canonically, and returns to an idle lifecycle', async () => {
    await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); screen.getByTestId('confirm').props.onPress(); });
    expect(await screen.findByText('idle:none')).toBeTruthy();
    expect(mockDelete).toHaveBeenCalledWith('user-a', 1);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test('maps a pre-refresh mutation failure without retrying or refreshing', async () => {
    const { WorkShiftDeleteError } = require('@/features/work/api/workShiftMutationsApi') as typeof import('@/features/work/api/workShiftMutationsApi');
    mockDelete.mockRejectedValueOnce(new WorkShiftDeleteError('blocked'));
    await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); });
    expect(await screen.findByText('blocked:1')).toBeTruthy();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('reconciles a refresh failure without repeating delete', async () => {
    mockRefresh.mockRejectedValueOnce(new Error('network'));
    await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); });
    expect(await screen.findByText('reconciliation_required:1')).toBeTruthy();
    expect(mockDelete).toHaveBeenCalledTimes(1);

    mockRefresh.mockResolvedValueOnce(undefined);
    await act(async () => { screen.getByTestId('reconcile').props.onPress(); screen.getByTestId('reconcile').props.onPress(); });
    expect(await screen.findByText('idle:none')).toBeTruthy();
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  test('ignores a stale delete completion after reset and a new confirmation', async () => {
    let resolveDelete: (() => void) | undefined;
    mockDelete.mockReturnValueOnce(new Promise<void>((resolve) => { resolveDelete = resolve; }));
    await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); });
    expect(await screen.findByText('deleting:1')).toBeTruthy();

    await act(async () => { screen.getByTestId('reset').props.onPress(); });
    await act(async () => { screen.getByTestId('request-b').props.onPress(); });
    expect(await screen.findByText('confirming:2')).toBeTruthy();
    await act(async () => { resolveDelete?.(); });
    expect(screen.getByText('confirming:2')).toBeTruthy();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('clears confirmation on logout and does not refresh a stale user request', async () => {
    let resolveDelete: (() => void) | undefined;
    mockDelete.mockReturnValueOnce(new Promise<void>((resolve) => { resolveDelete = resolve; }));
    const view = await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); });
    expect(await screen.findByText('deleting:1')).toBeTruthy();

    mockAuth = signedOut();
    await view.rerender(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    expect(await screen.findByText('idle:none')).toBeTruthy();
    await act(async () => { resolveDelete?.(); });
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('clears user A state before a stale completion can refresh user B', async () => {
    let resolveDelete: (() => void) | undefined;
    mockDelete.mockReturnValueOnce(new Promise<void>((resolve) => { resolveDelete = resolve; }));
    const view = await render(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    await act(async () => { screen.getByTestId('request-a').props.onPress(); });
    await act(async () => { screen.getByTestId('confirm').props.onPress(); });
    mockAuth = authenticated('user-b');
    await view.rerender(<WorkShiftDeleteProvider><Probe /></WorkShiftDeleteProvider>);
    expect(await screen.findByText('idle:none')).toBeTruthy();
    await act(async () => { resolveDelete?.(); });
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
