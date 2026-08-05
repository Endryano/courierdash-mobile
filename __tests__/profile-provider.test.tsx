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

function deferredState() {
  let resolve: ((state: ProfileBootstrapState) => void) | undefined;
  const promise = new Promise<ProfileBootstrapState>((completion) => {
    resolve = completion;
  });

  return { promise, resolve: (state: ProfileBootstrapState) => resolve?.(state) };
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

  test.each<ProfileBootstrapState>([
    { status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } },
    { status: 'needs_nickname', profile: null, reason: 'missing_profile' },
    { status: 'recoverable_error', profile: null, error: 'network_unavailable' },
    { status: 'blocked', profile: null, error: 'forbidden' },
  ])('keeps retry pending until bootstrap settles with $status', async (result) => {
    let retry: (() => Promise<void>) | undefined;
    const retryBootstrap = deferredState();
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } });
    mockBootstrapProfile.mockImplementationOnce(() => retryBootstrap.promise);

    function RetryProbe() {
      retry = useProfile().retry;
      return <ProfileProbe />;
    }

    await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    expect(await screen.findByText('ready')).toBeTruthy();

    let retryPromise: Promise<void> | undefined;
    await act(async () => { retryPromise = retry?.(); });
    let settled = false;
    void retryPromise?.then(() => { settled = true; });

    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(2));
    expect(settled).toBe(false);

    await act(async () => { retryBootstrap.resolve(result); });

    await waitFor(() => expect(settled).toBe(true));
    expect(screen.getByText(result.status)).toBeTruthy();
  });

  test('shares one pending retry and starts one effective bootstrap', async () => {
    let retry: (() => Promise<void>) | undefined;
    const retryBootstrap = deferredState();
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'recoverable_error', profile: null, error: 'network_unavailable' });
    mockBootstrapProfile.mockImplementationOnce(() => retryBootstrap.promise);

    function RetryProbe() {
      retry = useProfile().retry;
      return <ProfileProbe />;
    }

    await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    expect(await screen.findByText('recoverable_error')).toBeTruthy();

    let firstRetry: Promise<void> | undefined;
    let secondRetry: Promise<void> | undefined;
    await act(async () => {
      firstRetry = retry?.();
      secondRetry = retry?.();
    });
    expect(secondRetry).toBe(firstRetry);

    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(2));
    await act(async () => { retryBootstrap.resolve({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } }); });
    await expect(firstRetry).resolves.toBeUndefined();
  });

  test('settles a pending retry on logout without allowing its stale result to commit', async () => {
    let retry: (() => Promise<void>) | undefined;
    const retryBootstrap = deferredState();
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'recoverable_error', profile: null, error: 'network_unavailable' });
    mockBootstrapProfile.mockImplementationOnce(() => retryBootstrap.promise);

    function RetryProbe() {
      retry = useProfile().retry;
      return <ProfileProbe />;
    }

    const view = await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    expect(await screen.findByText('recoverable_error')).toBeTruthy();
    let retryPromise: Promise<void> | undefined;
    await act(async () => { retryPromise = retry?.(); });
    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(2));

    mockAuthState = { status: 'unauthenticated', isAuthenticated: false, user: null, session: null };
    await view.rerender(<ProfileProvider><RetryProbe /></ProfileProvider>);
    await expect(retryPromise).resolves.toBeUndefined();
    expect(await screen.findByText('idle')).toBeTruthy();

    await act(async () => { retryBootstrap.resolve({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } }); });
    expect(screen.getByText('idle')).toBeTruthy();
  });

  test('settles User A retry, bootstraps User B, and ignores User A stale result', async () => {
    let retry: (() => Promise<void>) | undefined;
    const retryBootstrap = deferredState();
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'recoverable_error', profile: null, error: 'network_unavailable' });
    mockBootstrapProfile.mockImplementationOnce(() => retryBootstrap.promise);
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'needs_nickname', profile: null, reason: 'missing_profile' });

    function RetryProbe() {
      retry = useProfile().retry;
      return <ProfileProbe />;
    }

    const view = await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    expect(await screen.findByText('recoverable_error')).toBeTruthy();
    let retryPromise: Promise<void> | undefined;
    await act(async () => { retryPromise = retry?.(); });
    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(2));

    mockAuthState = authenticatedState('user-b');
    await view.rerender(<ProfileProvider><RetryProbe /></ProfileProvider>);
    await expect(retryPromise).resolves.toBeUndefined();
    expect(await screen.findByText('needs_nickname')).toBeTruthy();

    await act(async () => { retryBootstrap.resolve({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } }); });
    expect(screen.getByText('needs_nickname')).toBeTruthy();
    expect(mockBootstrapProfile).toHaveBeenLastCalledWith('user-b', {});
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

  test('settles a pending retry when the provider unmounts', async () => {
    let retry: (() => Promise<void>) | undefined;
    const retryBootstrap = deferredState();
    mockAuthState = authenticatedState('user-a');
    mockBootstrapProfile.mockResolvedValueOnce({ status: 'ready', profile: { id: 'user-a', nickname: 'Courier_1' } });
    mockBootstrapProfile.mockImplementationOnce(() => retryBootstrap.promise);

    function RetryProbe() {
      retry = useProfile().retry;
      return <ProfileProbe />;
    }

    const view = await render(<ProfileProvider><RetryProbe /></ProfileProvider>);
    expect(await screen.findByText('ready')).toBeTruthy();
    let retryPromise: Promise<void> | undefined;
    await act(async () => { retryPromise = retry?.(); });
    await waitFor(() => expect(mockBootstrapProfile).toHaveBeenCalledTimes(2));

    await view.unmount();
    await expect(retryPromise).resolves.toBeUndefined();
  });

  test('does not duplicate bootstrap work in Strict Mode', async () => {
    mockAuthState = authenticatedState('user-a');

    await render(<StrictMode><ProfileProvider><ProfileProbe /></ProfileProvider></StrictMode>);

    expect(await screen.findByText('ready')).toBeTruthy();
    expect(mockBootstrapProfile).toHaveBeenCalledTimes(1);
  });
});
