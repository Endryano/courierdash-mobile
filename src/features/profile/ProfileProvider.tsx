import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';

import { bootstrapProfile } from './profileBootstrap';
import type { ProfileBootstrapState } from './profileTypes';
import { ProfileContext } from './profileContext';

const idleState: ProfileBootstrapState = { status: 'idle', profile: null };

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session, status, user } = useAuth();
  const [state, setState] = useState<ProfileBootstrapState>(idleState);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersion = useRef(0);

  const retry = useCallback(() => {
    setRetryVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const requestId = ++requestVersion.current;

    if (status !== 'authenticated' || session === null || user === null) {
      queueMicrotask(() => {
        if (requestVersion.current === requestId) {
          setState(idleState);
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (requestVersion.current === requestId) {
        setState({ status: 'loading', profile: null });
      }
    });
    void Promise.resolve().then(() => {
      if (requestVersion.current !== requestId) return null;

      return bootstrapProfile(user.id, user.user_metadata);
    }).then((nextState) => {
        if (nextState === null) return;

        if (requestVersion.current === requestId) {
          setState(nextState);
        }
      });

    return () => {
      requestVersion.current += 1;
    };
  }, [retryVersion, session, status, user]);

  const value = useMemo(() => ({ ...state, retry }), [retry, state]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
