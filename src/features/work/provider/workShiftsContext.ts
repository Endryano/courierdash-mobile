import { createContext } from 'react';

import type { WorkShiftsState } from '../domain/workShift';

export type WorkShiftsContextValue = WorkShiftsState & {
  retry: () => Promise<void>;
  subjectUserId: string | null;
};

export const WorkShiftsContext = createContext<WorkShiftsContextValue | null>(null);
