import { useContext } from 'react';

import { WorkShiftsContext, type WorkShiftsContextValue } from '../provider/workShiftsContext';

export function useWorkShifts(): WorkShiftsContextValue {
  const workShifts = useContext(WorkShiftsContext);

  if (workShifts === null) {
    throw new Error('useWorkShifts must be used within WorkShiftsProvider');
  }

  return workShifts;
}
