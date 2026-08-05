import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';

import { bootstrapProfile } from './profileBootstrap';
import type { ProfileBootstrapState } from './profileTypes';
import { ProfileContext } from './profileContext';

const idleState: ProfileBootstrapState = { status: 'idle', profile: null };

type RetryOperation = {
  userId: string;
  promise: Promise<void>;
  resolve: () => void;
};

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session, status, user } = useAuth();
  const authenticatedUserId = status === 'authenticated' && session !== null && user !== null ? user.id : null;
  const [state, setState] = useState<ProfileBootstrapState>(idleState);
  const [stateUserId, setStateUserId] = useState<string | null>(authenticatedUserId);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersion = useRef(0);
  const retryOperation = useRef<RetryOperation | null>(null);

  const settleRetry = useCallback((userId?: string) => {
    const operation = retryOperation.current;

    if (operation === null || (userId !== undefined && operation.userId !== userId)) return;

    retryOperation.current = null;
    operation.resolve();
  }, []);

  if (stateUserId !== authenticatedUserId) {
    setStateUserId(authenticatedUserId);
    setState(idleState);
  }

  const retry = useCallback((): Promise<void> => {
    if (authenticatedUserId === null) return Promise.resolve();

    const existingOperation = retryOperation.current;
    if (existingOperation?.userId === authenticatedUserId) return existingOperation.promise;

    settleRetry();

    let resolve!: () => void;
    const promise = new Promise<void>((completion) => {
      resolve = completion;
    });

    retryOperation.current = { userId: authenticatedUserId, promise, resolve };
    setRetryVersion((version) => version + 1);
    return promise;
  }, [authenticatedUserId, settleRetry]);

  useEffect(() => () => {
    settleRetry();
  }, [settleRetry]);

  useEffect(() => {
    const requestId = ++requestVersion.current;

    if (status !== 'authenticated' || session === null || user === null) {
      settleRetry();
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
    if (retryOperation.current?.userId !== user.id) settleRetry();

    void Promise.resolve().then(() => {
      if (requestVersion.current !== requestId) return null;

      return bootstrapProfile(user.id, user.user_metadata);
    }).then((nextState) => {
        if (nextState === null) return;

        if (requestVersion.current === requestId) {
          setState(nextState);
          settleRetry(user.id);
        }
      }).catch(() => {
        if (requestVersion.current !== requestId) return;

        setState({ status: 'blocked', profile: null, error: 'unknown' });
        settleRetry(user.id);
      });

    return () => {
      requestVersion.current += 1;
    };
  }, [retryVersion, session, settleRetry, status, user]);

  const value = useMemo(
    () => ({ ...state, retry, subjectUserId: stateUserId }),
    [retry, state, stateUserId],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
