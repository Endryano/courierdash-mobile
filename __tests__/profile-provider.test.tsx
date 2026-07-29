import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { AuthState } from '@/features/auth/authTypes';
import type { ProfileBootstrapState } from '@/features/profile/profileTypes';

const mockBootstrapProfile = jest.fn<(userId: string, metadata: unknown) => Promise<ProfileBootstrapState>>();
let mockAuthState: AuthState;

jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuthState }));
jest.mock('@/features/profile/profileBootstrap', () => ({ bootstrapProfile: mockBootstrapProfile }));

const { ProfileProvider } = require('@/features/profile/ProfileProvider') as typeof import('@/features/profile/ProfileProvider');
const { useProfile } = require('@/features/profile/useProfile') as typeof import('@/features/profile/useProfile');

function authenticatedState(id: string, metadata: Record<string, unknown> = {}): AuthState {
  const user = { id, user_metadata: metadata } as AuthState['user'];
  return { status: 'authenticated', isAuthenticated: true, user, session: { user } as AuthState['session'] };
}

function ProfileProbe() {
  const profile = useProfile();
  return <Text>{profile.status}</Text>;
}

describe('ProfileProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { status: 'unauthenticated', isAuthenticated: false, user: null, session: null };
    mockBootstrapProfile.mockResolvedValue({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } });
  });

  test('stays idle without a session and does not bootstrap while Auth is loading', async () => {
    const view = await render(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    expect(screen.getByText('idle')).toBeTruthy();
    expect(mockBootstrapProfile).not.toHaveBeenCalled();

    mockAuthState = { status: 'initializing', isAuthenticated: false, user: null, session: null };
    await view.rerender(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    expect(screen.getByText('idle')).toBeTruthy();
    expect(mockBootstrapProfile).not.toHaveBeenCalled();
  });

  test('bootstraps the current authenticated user and resets on logout', async () => {
    mockAuthState = authenticatedState('user-a', { nickname: 'Courier_1' });
    const view = await render(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    expect(await screen.findByText('ready')).toBeTruthy();
    expect(mockBootstrapProfile).toHaveBeenCalledWith('user-a', { nickname: 'Courier_1' });

    mockAuthState = { status: 'unauthenticated', isAuthenticated: false, user: null, session: null };
    await view.rerender(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    expect(await screen.findByText('idle')).toBeTruthy();
  });

  test('ignores a stale result after switching users', async () => {
    let resolveA: ((state: ProfileBootstrapState) => void) | undefined;
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockImplementationOnce(() => new Promise((resolve) => { resolveA = resolve; }));
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'needs_nickname', profile: null, reason: 'missing_profile' });
    const view = await render(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    mockAuthState = authenticatedState('user-b');
    await view.rerender(<ProfileProvider><ProfileProbe /></ProfileProvider>);
    expect(await screen.findByText('needs_nickname')).toBeTruthy();

    await act(async () => { resolveA?.({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } }); });

    expect(screen.getByText('needs_nickname')).toBeTruthy();
    expect(screen.queryByText('ready')).toBeNull();
  });

  test('retry starts a newer bootstrap and a stale retry cannot replace it', async () => {
    let resolveFirst: ((state: ProfileBootstrapState) => void) | undefined;
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } });

    function RetryProbe() {
      const profile = useProfile();
      return <Text onPress={profile.retry}>{profile.status}</Text>;
    }

    await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    await act(async () => { screen.getByText('loading').props.onPress(); });

    expect(await screen.findByText('ready')).toBeTruthy();
    await act(async () => { resolveFirst?.({ status: 'needs_nickname', profile: null, reason: 'missing_profile' }); });

    expect(screen.getByText('ready')).toBeTruthy();
    expect(mockBootstrapProfile).toHaveBeenCalledTimes(2);
  });

  test('does not update state after unmounting during a request', async () => {
    let resolveRequest: ((state: ProfileBootstrapState) => void) | undefined;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockImplementationOnce(() => new Promise((resolve) => { resolveRequest = resolve; }));
    const view = await render(<ProfileProvider><ProfileProbe /></ProfileProvider>);

    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(1));
    await view.unmount();
    resolveRequest?.({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } });
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
  });

  test('does not duplicate bootstrap work in Strict Mode', async () => {
    mockAuthState = authenticatedState('user-a');

    await render(<StrictMode><ProfileProvider><ProfileProbe /></ProfileProvider></StrictMode>);

    expect(await screen.findByText('ready')).toBeTruthy();
    expect(mockBootstrapProfile).toHaveBeenCalledTimes(1);
  });
});
