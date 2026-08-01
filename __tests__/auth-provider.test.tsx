import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

type GetSessionResult = { data: { session: Session | null } };

const mockGetSession: jest.MockedFunction<() => Promise<GetSessionResult>> = jest.fn();
const mockUnsubscribe = jest.fn();
const mockLifecycleCleanup = jest.fn();
const mockSignOut = jest.fn<() => Promise<void>>();
let mockAuthListener: ((event: AuthChangeEvent, session: Session | null) => void) | undefined;
let currentSignOut: (() => Promise<void>) | undefined;

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: jest.fn((listener: (event: AuthChangeEvent, session: Session | null) => void) => {
        mockAuthListener = listener;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
  },
}));

jest.mock('@/features/auth/sessionLifecycle', () => ({
  subscribeToAppStateAutoRefresh: jest.fn(() => mockLifecycleCleanup),
}));

jest.mock('@/features/auth/authApi', () => ({
  signOut: mockSignOut,
}));

const { AuthProvider } = require('@/features/auth/AuthProvider') as typeof import('@/features/auth/AuthProvider');
const { useAuth } = require('@/features/auth/useAuth') as typeof import('@/features/auth/useAuth');

function createSession(userId: string): Session {
  return {
    access_token: `test-access-token-${userId}`,
    refresh_token: `test-refresh-token-${userId}`,
    expires_in: 3600,
    expires_at: 2_000_000_000,
    token_type: 'bearer',
    user: {
      id: userId,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  };
}

function AuthStateProbe() {
  const { isAuthenticated, signOut, status, user } = useAuth();
  currentSignOut = signOut;

  return (
    <>
      <Text>{`${status}:${isAuthenticated}:${user?.id ?? 'none'}`}</Text>
      <Pressable onPress={() => void signOut()} testID="auth-sign-out" />
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthListener = undefined;
    currentSignOut = undefined;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignOut.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockAuthListener = undefined;
  });

  test('starts in initializing state', async () => {
    mockGetSession.mockReturnValue(new Promise(() => undefined));

    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('initializing:false:none')).toBeTruthy();
  });

  test('bootstraps an authenticated session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: createSession('test-user') } });

    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('authenticated:true:test-user')).toBeTruthy();
  });

  test('bootstraps an unauthenticated state when no session exists', async () => {
    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('unauthenticated:false:none')).toBeTruthy();
  });

  test('finishes bootstrap safely when getSession fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetSession.mockRejectedValue(new Error('test-session-error'));

    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('unauthenticated:false:none')).toBeTruthy();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('updates state from auth events', async () => {
    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockAuthListener).toBeDefined());
    await act(async () => {
      mockAuthListener?.('SIGNED_IN', createSession('event-user'));
    });

    expect(await screen.findByText('authenticated:true:event-user')).toBeTruthy();
  });

  test('does not let a stale bootstrap result overwrite an auth event', async () => {
    let resolveBootstrap: ((value: { data: { session: Session | null } }) => void) | undefined;
    mockGetSession.mockReturnValue(
      new Promise((resolve) => {
        resolveBootstrap = resolve;
      }),
    );

    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mockAuthListener).toBeDefined());
    await act(async () => {
      mockAuthListener?.('SIGNED_IN', createSession('newer-event-user'));
      resolveBootstrap?.({ data: { session: createSession('stale-bootstrap-user') } });
    });

    expect(await screen.findByText('authenticated:true:newer-event-user')).toBeTruthy();
    expect(screen.queryByText('authenticated:true:stale-bootstrap-user')).toBeNull();
  });

  test('removes auth and AppState subscriptions on unmount', async () => {
    const { unmount } = await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockLifecycleCleanup).toHaveBeenCalledTimes(1);
  });

  test('exposes canonical signOut without manually changing session state', async () => {
    mockGetSession.mockResolvedValue({ data: { session: createSession('signed-in-user') } });
    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('authenticated:true:signed-in-user')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('auth-sign-out'));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(screen.getByText('authenticated:true:signed-in-user')).toBeTruthy();

    await act(async () => {
      mockAuthListener?.('SIGNED_OUT', null);
    });
    expect(await screen.findByText('unauthenticated:false:none')).toBeTruthy();
  });

  test('propagates a signOut failure without clearing the current session', async () => {
    const safeError = new Error('safe logout failure');
    mockGetSession.mockResolvedValue({ data: { session: createSession('signed-in-user') } });
    mockSignOut.mockRejectedValue(safeError);
    await render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('authenticated:true:signed-in-user')).toBeTruthy();
    await expect(currentSignOut?.()).rejects.toBe(safeError);
    expect(screen.getByText('authenticated:true:signed-in-user')).toBeTruthy();
  });
});
