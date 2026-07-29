import { useContext } from 'react';
import { WorkShiftCreateContext, type WorkShiftCreateContextValue } from '../provider/workShiftCreateContext';

export function useWorkShiftCreate(): WorkShiftCreateContextValue {
  const value = useContext(WorkShiftCreateContext);
  if (value === null) throw new Error('useWorkShiftCreate must be used within WorkShiftCreateProvider');
  return value;
}
