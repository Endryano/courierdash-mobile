import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';

import { WorkShiftMutationError, createOwnWorkShift } from '../api/workShiftMutationsApi';
import type { WorkShiftCreateInput } from '../domain/workShiftCreate';
import { validateWorkShiftCreate } from '../domain/workShiftValidation';
import { useWorkShifts } from '../hooks/useWorkShifts';
import { WorkShiftCreateContext, type WorkShiftCreateState } from './workShiftCreateContext';

const idleState: WorkShiftCreateState = { status: 'idle' };

export function WorkShiftCreateProvider({ children }: PropsWithChildren) {
  const { session, status, user } = useAuth();
  const { retry: refreshWorkShifts } = useWorkShifts();
  const userId = status === 'authenticated' && session !== null && user !== null ? user.id : null;
  const [state, setState] = useState<WorkShiftCreateState>(idleState);
  const subjectUserId = useRef<string | null>(userId);
  const requestVersion = useRef(0);
  const submitting = useRef(false);

  useEffect(() => {
    if (subjectUserId.current !== userId) {
      subjectUserId.current = userId;
      submitting.current = false;
      requestVersion.current += 1;
      setState(idleState);
    }
  }, [userId]);

  useEffect(() => () => { requestVersion.current += 1; }, []);

  const reset = useCallback(() => {
    if (!submitting.current) setState(idleState);
  }, []);

  const reconcile = useCallback(async () => {
    if (userId === null || submitting.current || state.status !== 'reconciliation_required') return;

    const requestId = ++requestVersion.current;
    submitting.current = true;
    setState({ status: 'submitting' });
    try {
      await refreshWorkShifts();
      if (requestVersion.current === requestId && subjectUserId.current === userId) setState({ status: 'success' });
    } catch {
      if (requestVersion.current === requestId && subjectUserId.current === userId) setState({ status: 'reconciliation_required' });
    } finally {
      if (requestVersion.current === requestId) submitting.current = false;
    }
  }, [refreshWorkShifts, state.status, userId]);

  const submit = useCallback(async (input: WorkShiftCreateInput) => {
    if (userId === null || submitting.current) return;
    const validation = validateWorkShiftCreate(input);
    if (!validation.isValid) { setState({ status: 'validation_error', error: validation.error }); return; }

    const requestId = ++requestVersion.current;
    submitting.current = true;
    setState({ status: 'submitting' });
    let inserted = false;
    try {
      await createOwnWorkShift(userId, validation.value);
      inserted = true;
      if (requestVersion.current !== requestId || subjectUserId.current !== userId) return;
      await refreshWorkShifts();
      if (requestVersion.current === requestId && subjectUserId.current === userId) setState({ status: 'success' });
    } catch (error) {
      if (requestVersion.current !== requestId || subjectUserId.current !== userId) return;
      if (inserted) {
        setState({ status: 'reconciliation_required' });
        return;
      }
      const category = error instanceof WorkShiftMutationError ? error.category : 'unknown';
      if (category === 'duplicate_date') setState({ status: 'duplicate_date' });
      else if (category === 'blocked') setState({ status: 'blocked' });
      else setState({ status: 'recoverable_error' });
    } finally {
      if (requestVersion.current === requestId) submitting.current = false;
    }
  }, [refreshWorkShifts, userId]);

  const value = useMemo(() => ({ ...state, submit, reconcile, reset, subjectUserId: userId }), [reconcile, reset, state, submit, userId]);
  return <WorkShiftCreateContext.Provider value={value}>{children}</WorkShiftCreateContext.Provider>;
}
