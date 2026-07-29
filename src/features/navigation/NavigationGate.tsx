import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { useProfile } from '@/features/profile/useProfile';

import { NavigationLoadingBoundary } from './NavigationLoadingBoundary';
import { ProfileNavigationBoundary } from './ProfileNavigationBoundary';
import { resolveNavigationDestination, routeForDestination, routeGroupFromSegments } from './navigationState';

export function NavigationGate() {
  const auth = useAuth();
  const profile = useProfile();
  const router = useRouter();
  const segments = useSegments();
  const lastReplacement = useRef<string | null>(null);
  const destination = useMemo(
    () => resolveNavigationDestination({
      authStatus: auth.status,
      isAuthenticated: auth.isAuthenticated,
      authenticatedUserId: auth.user?.id ?? null,
      profileStatus: profile.status,
      profileSubjectUserId: profile.subjectUserId,
    }),
    [auth.isAuthenticated, auth.status, auth.user?.id, profile.status, profile.subjectUserId],
  );
  const activeGroup = routeGroupFromSegments(segments);
  const targetRoute = routeForDestination(destination);
  const targetGroup = targetRoute === null ? null : routeGroupFromSegments(targetRoute.split('/').filter(Boolean));
  const routeIsAllowed = targetGroup !== null && activeGroup === targetGroup;

  useEffect(() => {
    if (targetRoute === null || routeIsAllowed) {
      lastReplacement.current = null;
      return;
    }

    const replacement = `${activeGroup ?? 'unknown'}:${targetRoute}`;
    if (lastReplacement.current === replacement) return;

    lastReplacement.current = replacement;
    router.replace(targetRoute as never);
  }, [activeGroup, routeIsAllowed, router, targetRoute]);

  if (destination === 'loading' || (targetRoute !== null && !routeIsAllowed)) {
    return <NavigationLoadingBoundary />;
  }

  if (destination === 'recoverable_error' || destination === 'blocked') {
    return <ProfileNavigationBoundary kind={destination} />;
  }

  return <Slot />;
}
