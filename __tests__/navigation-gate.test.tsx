import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

let mockSegments: string[] = [];
const mockReplace = jest.fn();
let mockAuth: { status: 'initializing' | 'authenticated' | 'unauthenticated'; isAuthenticated: boolean; user: { id: string } | null };
let mockProfile: { status: 'idle' | 'loading' | 'ready' | 'needs_nickname' | 'recoverable_error' | 'blocked'; subjectUserId: string | null; retry: () => Promise<void>; profile: null };

jest.mock('expo-router', () => ({
  Slot: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'router-slot');
  },
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => mockSegments,
}));
jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => mockProfile }));
jest.mock('@/features/navigation/NavigationLoadingBoundary', () => ({
  NavigationLoadingBoundary: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'loading-boundary');
  },
}));
jest.mock('@/features/navigation/ProfileNavigationBoundary', () => ({
  ProfileNavigationBoundary: ({ kind }: { kind: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, `${kind}-boundary`);
  },
}));

const { NavigationGate } = require('@/features/navigation/NavigationGate') as typeof import('@/features/navigation/NavigationGate');

function setState(status: typeof mockAuth.status, profileStatus: typeof mockProfile.status, segments: string[], userId: string | null = status === 'authenticated' ? 'user-1' : null, subjectUserId: string | null = userId) {
  mockAuth = { status, isAuthenticated: status === 'authenticated', user: userId === null ? null : { id: userId } };
  mockProfile = { status: profileStatus, subjectUserId, retry: async () => undefined, profile: null };
  mockSegments = segments;
}

describe('NavigationGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setState('unauthenticated', 'idle', ['(app)', 'index']);
  });

  test('corrects an unauthenticated deep link to the auth group once', async () => {
    const view = await render(<NavigationGate />);

    expect(screen.getByText('loading-boundary')).toBeTruthy();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    await view.rerender(<NavigationGate />);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  test('keeps an allowed app route without replacement', async () => {
    setState('authenticated', 'ready', ['(app)', 'index']);
    await render(<NavigationGate />);

    expect(screen.getByText('router-slot')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  const correctionCases: Array<{
    authStatus: 'authenticated' | 'unauthenticated';
    profileStatus: 'idle' | 'ready' | 'needs_nickname';
    segments: string[];
    target: string;
  }> = [
    { authStatus: 'authenticated', profileStatus: 'needs_nickname', segments: ['(auth)', 'login'], target: '/(onboarding)/nickname' },
    { authStatus: 'authenticated', profileStatus: 'ready', segments: ['(onboarding)', 'nickname'], target: '/(app)' },
    { authStatus: 'unauthenticated', profileStatus: 'idle', segments: ['(onboarding)', 'nickname'], target: '/(auth)/login' },
  ];

  for (const { authStatus, profileStatus, segments, target } of correctionCases) {
    test(`corrects a disallowed route group to ${target}`, async () => {
      setState(authStatus, profileStatus, segments);
      await render(<NavigationGate />);

      expect(mockReplace).toHaveBeenCalledWith(target);
    });
  }

  test('shows state-derived boundaries without rendering a route', async () => {
    setState('authenticated', 'loading', ['(auth)', 'login']);
    const view = await render(<NavigationGate />);
    expect(screen.getByText('loading-boundary')).toBeTruthy();

    setState('authenticated', 'recoverable_error', ['(app)', 'index']);
    await view.rerender(<NavigationGate />);
    expect(screen.getByText('recoverable_error-boundary')).toBeTruthy();
    expect(screen.queryByText('router-slot')).toBeNull();

    setState('authenticated', 'blocked', ['(app)', 'index']);
    await view.rerender(<NavigationGate />);
    expect(screen.getByText('blocked-boundary')).toBeTruthy();
  });

  test('transitions onboarding to app, returns logout to auth, and never exposes a previous user route', async () => {
    setState('authenticated', 'needs_nickname', ['(onboarding)', 'nickname']);
    const view = await render(<NavigationGate />);
    expect(screen.getByText('router-slot')).toBeTruthy();

    setState('authenticated', 'ready', ['(onboarding)', 'nickname']);
    await view.rerender(<NavigationGate />);
    expect(mockReplace).toHaveBeenCalledWith('/(app)');

    setState('authenticated', 'ready', ['(app)', 'index']);
    await view.rerender(<NavigationGate />);
    expect(screen.getByText('router-slot')).toBeTruthy();

    setState('authenticated', 'ready', ['(app)', 'index'], 'user-b', 'user-a');
    await view.rerender(<NavigationGate />);
    expect(screen.getByText('loading-boundary')).toBeTruthy();
    expect(screen.queryByText('router-slot')).toBeNull();

    setState('unauthenticated', 'idle', ['(app)', 'index']);
    await view.rerender(<NavigationGate />);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
