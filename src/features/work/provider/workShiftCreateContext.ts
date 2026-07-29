import { createContext } from 'react';

import type { WorkShiftCreateInput } from '../domain/workShiftCreate';
import type { WorkShiftValidationError } from '../domain/workShiftValidation';

export type WorkShiftCreateState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'validation_error'; error: WorkShiftValidationError }
  | { status: 'duplicate_date' }
  | { status: 'recoverable_error' }
  | { status: 'reconciliation_required' }
  | { status: 'blocked' };

export type WorkShiftCreateContextValue = WorkShiftCreateState & {
  submit: (input: WorkShiftCreateInput) => Promise<void>;
  reconcile: () => Promise<void>;
  reset: () => void;
  subjectUserId: string | null;
};

export const WorkShiftCreateContext = createContext<WorkShiftCreateContextValue | null>(null);
