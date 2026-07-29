import { describe, expect, test } from '@jest/globals';

import { resolveNavigationDestination, routeForDestination, routeGroupFromSegments } from '@/features/navigation/navigationState';

const userId = 'user-1';

describe('navigation state', () => {
  const cases: Array<{
    input: Parameters<typeof resolveNavigationDestination>[0];
    expected: ReturnType<typeof resolveNavigationDestination>;
  }> = [
    { input: { authStatus: 'initializing', isAuthenticated: false, profileStatus: 'idle', profileSubjectUserId: null, authenticatedUserId: null }, expected: 'loading' },
    { input: { authStatus: 'unauthenticated', isAuthenticated: false, profileStatus: 'idle', profileSubjectUserId: null, authenticatedUserId: null }, expected: 'auth' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'idle', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'loading' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'loading', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'loading' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'needs_nickname', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'onboarding' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'ready', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'app' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'recoverable_error', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'recoverable_error' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'blocked', profileSubjectUserId: userId, authenticatedUserId: userId }, expected: 'blocked' },
    { input: { authStatus: 'authenticated', isAuthenticated: true, profileStatus: 'ready', profileSubjectUserId: 'user-a', authenticatedUserId: 'user-b' }, expected: 'loading' },
  ];

  for (const { input, expected } of cases) {
    test(`resolves to ${expected}`, () => {
      expect(resolveNavigationDestination(input)).toBe(expected);
    });
  }

  test('maps only protected flow destinations to canonical routes', () => {
    expect(routeForDestination('auth')).toBe('/(auth)/login');
    expect(routeForDestination('onboarding')).toBe('/(onboarding)/nickname');
    expect(routeForDestination('app')).toBe('/(app)');
    expect(routeForDestination('loading')).toBeNull();
    expect(routeGroupFromSegments(['(app)', 'index'])).toBe('app');
    expect(routeGroupFromSegments(['unknown'])).toBeNull();
  });
});
