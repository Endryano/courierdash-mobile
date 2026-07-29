import type { AuthStatus } from '@/features/auth/authTypes';
import type { ProfileBootstrapState } from '@/features/profile/profileTypes';

export type NavigationDestination = 'loading' | 'auth' | 'onboarding' | 'app' | 'recoverable_error' | 'blocked';

type NavigationStateInput = {
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  profileStatus: ProfileBootstrapState['status'];
  profileSubjectUserId: string | null;
  authenticatedUserId: string | null;
};

export function resolveNavigationDestination({
  authStatus,
  isAuthenticated,
  profileStatus,
  profileSubjectUserId,
  authenticatedUserId,
}: NavigationStateInput): NavigationDestination {
  if (authStatus === 'initializing') return 'loading';
  if (!isAuthenticated || authenticatedUserId === null) return 'auth';
  if (profileSubjectUserId !== authenticatedUserId) return 'loading';
  if (profileStatus === 'idle' || profileStatus === 'loading') return 'loading';
  if (profileStatus === 'needs_nickname') return 'onboarding';
  if (profileStatus === 'ready') return 'app';
  if (profileStatus === 'recoverable_error') return 'recoverable_error';
  return 'blocked';
}

export function routeGroupFromSegments(segments: readonly string[]): 'auth' | 'onboarding' | 'app' | null {
  if (segments[0] === '(auth)') return 'auth';
  if (segments[0] === '(onboarding)') return 'onboarding';
  if (segments[0] === '(app)') return 'app';
  return null;
}

export function routeForDestination(destination: NavigationDestination): string | null {
  if (destination === 'auth') return '/(auth)/login';
  if (destination === 'onboarding') return '/(onboarding)/nickname';
  if (destination === 'app') return '/(app)';
  return null;
}
