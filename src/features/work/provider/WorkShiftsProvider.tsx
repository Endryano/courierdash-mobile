import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';

import { WorkShiftsApiError, getOwnWorkShifts } from '../api/workShiftsApi';
import type { WorkShiftsState } from '../domain/workShift';
import { WorkShiftsContext } from './workShiftsContext';

const idleState: WorkShiftsState = { status: 'idle', shifts: [] };

export function WorkShiftsProvider({ children }: PropsWithChildren) {
  const { session, status, user } = useAuth();
  const authenticatedUserId = status === 'authenticated' && session !== null && user !== null ? user.id : null;
  const [state, setState] = useState<WorkShiftsState>(idleState);
  const [stateUserId, setStateUserId] = useState<string | null>(authenticatedUserId);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersion = useRef(0);
  const retryInFlight = useRef(false);

  if (stateUserId !== authenticatedUserId) {
    setStateUserId(authenticatedUserId);
    setState(idleState);
  }

  const retry = useCallback(async () => {
    if (authenticatedUserId === null || retryInFlight.current) return;

    retryInFlight.current = true;
    setRetryVersion((version) => version + 1);
  }, [authenticatedUserId]);

  useEffect(() => {
    const requestId = ++requestVersion.current;

    if (authenticatedUserId === null) {
      retryInFlight.current = false;
      queueMicrotask(() => {
        if (requestVersion.current === requestId) setState(idleState);
      });
      return;
    }

    queueMicrotask(() => {
      if (requestVersion.current === requestId) setState({ status: 'loading', shifts: [] });
    });
    void Promise.resolve()
      .then(() => getOwnWorkShifts(authenticatedUserId))
      .then((shifts) => {
        if (requestVersion.current !== requestId) return;

        retryInFlight.current = false;
        setState(shifts.length === 0 ? { status: 'empty', shifts } : { status: 'ready', shifts });
      })
      .catch((error: unknown) => {
        if (requestVersion.current !== requestId) return;

        retryInFlight.current = false;
        const category = error instanceof WorkShiftsApiError ? error.category : 'unknown';
        setState(category === 'forbidden'
          ? { status: 'blocked', shifts: [], error: category }
          : { status: 'recoverable_error', shifts: [], error: category });
      });

    return () => {
      requestVersion.current += 1;
    };
  }, [authenticatedUserId, retryVersion]);

  const value = useMemo(
    () => ({ ...state, retry, subjectUserId: stateUserId }),
    [retry, state, stateUserId],
  );

  return <WorkShiftsContext.Provider value={value}>{children}</WorkShiftsContext.Provider>;
}
