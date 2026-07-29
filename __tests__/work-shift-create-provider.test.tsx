import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { AuthState } from '@/features/auth/authTypes';
import { createEmptyWorkShiftInput, type WorkShiftCreateInput } from '@/features/work/domain/workShiftCreate';

let mockAuthState: AuthState;
const mockCreate = jest.fn<(userId: string, input: unknown) => Promise<void>>();
const mockRefresh = jest.fn<() => Promise<void>>();

jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuthState }));
jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => ({ retry: mockRefresh }) }));
jest.mock('@/features/work/api/workShiftMutationsApi', () => {
  class WorkShiftMutationError extends Error {
    category: string;
    constructor(mockErrorCategory: string) {
      super('safe mutation error');
      this.category = mockErrorCategory;
    }
  }
  return { WorkShiftMutationError, createOwnWorkShift: mockCreate };
});

const { WorkShiftCreateProvider } = require('@/features/work/provider/WorkShiftCreateProvider') as typeof import('@/features/work/provider/WorkShiftCreateProvider');
const { useWorkShiftCreate } = require('@/features/work/hooks/useWorkShiftCreate') as typeof import('@/features/work/hooks/useWorkShiftCreate');
const { WorkShiftMutationError } = require('@/features/work/api/workShiftMutationsApi') as typeof import('@/features/work/api/workShiftMutationsApi');

function authenticated(id = 'user-a'): AuthState {
  const user = { id } as AuthState['user'];
  return { status: 'authenticated', isAuthenticated: true, user, session: { user } as AuthState['session'] };
}

function validInput(): WorkShiftCreateInput {
  const input = createEmptyWorkShiftInput();
  input.date = '2026-07-29';
  input.platforms.uber.enabled = true;
  return input;
}

function Probe() {
  const create = useWorkShiftCreate();
  return <><Text testID="create-state" onPress={() => void create.submit(validInput())}>{create.status}</Text><Text testID="reconcile" onPress={() => void create.reconcile()}>reconcile</Text></>;
}

describe('WorkShiftCreateProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = authenticated();
    mockCreate.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);
  });

  test('keeps an unauthenticated caller idle and does not write', async () => {
    mockAuthState = { status: 'unauthenticated', isAuthenticated: false, user: null, session: null };
    await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    await fireSubmit();
    expect(screen.getByTestId('create-state').children).toEqual(['idle']);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('reports validation locally without attempting an insert', async () => {
    await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    function InvalidProbe() {
      const create = useWorkShiftCreate();
      return <Text testID="invalid-state" onPress={() => void create.submit(createEmptyWorkShiftInput())}>{create.status}</Text>;
    }
    await render(<WorkShiftCreateProvider><InvalidProbe /></WorkShiftCreateProvider>);
    await act(async () => { screen.getByTestId('invalid-state').props.onPress(); });
    expect(screen.getByTestId('invalid-state').children).toEqual(['validation_error']);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('inserts once, waits for canonical refresh, then succeeds', async () => {
    let resolveRefresh: (() => void) | undefined;
    mockRefresh.mockReturnValueOnce(new Promise((resolve) => { resolveRefresh = resolve; }));
    await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    await fireSubmit();
    expect(await screen.findByText('submitting')).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    resolveRefresh?.();
    expect(await screen.findByText('success')).toBeTruthy();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['duplicate_date', 'duplicate_date'],
    ['blocked', 'blocked'],
    ['recoverable', 'recoverable_error'],
  ] as const)('maps %s to the safe %s state', async (...[category, expectedStatus]) => {
    mockCreate.mockRejectedValueOnce(new WorkShiftMutationError(category));
    await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    await fireSubmit();
    expect(await screen.findByText(expectedStatus)).toBeTruthy();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('does not publish a stale completion after the authenticated user changes', async () => {
    let resolveCreate: (() => void) | undefined;
    mockCreate.mockReturnValueOnce(new Promise((resolve) => { resolveCreate = resolve; }));
    const view = await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    await fireSubmit();
    mockAuthState = authenticated('user-b');
    await view.rerender(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    resolveCreate?.();
    await waitFor(() => expect(screen.getByTestId('create-state').children).toEqual(['idle']));
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('requires reconciliation after insert succeeds but refresh fails without reinserting', async () => {
    mockRefresh.mockRejectedValueOnce(new Error('network unavailable'));
    await render(<WorkShiftCreateProvider><Probe /></WorkShiftCreateProvider>);
    await fireSubmit();
    expect(await screen.findByText('reconciliation_required')).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    mockRefresh.mockResolvedValueOnce(undefined);
    await act(async () => { screen.getByTestId('reconcile').props.onPress(); });
    expect(await screen.findByText('success')).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });
});

async function fireSubmit() {
  await act(async () => { screen.getByTestId('create-state').props.onPress(); });
}
