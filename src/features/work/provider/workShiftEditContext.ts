import { createContext } from 'react';
import type { WorkShiftEditInput } from '../domain/workShiftEdit';
import type { WorkShiftEditable } from '../domain/workShiftEditable';
import type { WorkShiftValidationError } from '../domain/workShiftValidation';

export type WorkShiftEditState =
  | { status: 'idle' } | { status: 'loading' } | { status: 'ready'; shift: WorkShiftEditable; input: WorkShiftEditInput }
  | { status: 'submitting'; shift: WorkShiftEditable; input: WorkShiftEditInput } | { status: 'success' }
  | { status: 'validation_error'; shift: WorkShiftEditable; input: WorkShiftEditInput; error: WorkShiftValidationError }
  | { status: 'duplicate_date'; shift: WorkShiftEditable; input: WorkShiftEditInput } | { status: 'recoverable_error' }
  | { status: 'blocked' } | { status: 'not_found' } | { status: 'reconciliation_required'; shift: WorkShiftEditable; input: WorkShiftEditInput };
export type WorkShiftEditContextValue = WorkShiftEditState & { load: (shiftId: number) => Promise<void>; submit: (input: WorkShiftEditInput) => Promise<void>; reconcile: () => Promise<void>; reset: () => void; subjectUserId: string | null };
export const WorkShiftEditContext = createContext<WorkShiftEditContextValue | null>(null);
