import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

import { signOut as signOutFromApi } from './authApi';
import { AuthContext, type AuthContextValue } from './authContext';
import type { AuthState } from './authTypes';
import { subscribeToAppStateAutoRefresh } from './sessionLifecycle';

const initialAuthState: AuthState = {
  session: null,
  user: null,
  status: 'initializing',
  isAuthenticated: false,
};

function toAuthState(session: AuthState['session']): AuthState {
  return {
    session,
    user: session?.user ?? null,
    status: session === null ? 'unauthenticated' : 'authenticated',
    isAuthenticated: session !== null,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const authEventWon = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventWon.current = true;

      if (isMounted) {
        setAuthState(toAuthState(session));
      }
    });

    async function bootstrapSession() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (isMounted && !authEventWon.current) {
          setAuthState(toAuthState(sessionData.session));
        }
      } catch {
        if (isMounted && !authEventWon.current) {
          setAuthState(toAuthState(null));
        }
      }
    }

    void bootstrapSession();
    const stopAppStateLifecycle = subscribeToAppStateAutoRefresh(supabase.auth);

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
      stopAppStateLifecycle();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ ...authState, signOut: signOutFromApi }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
