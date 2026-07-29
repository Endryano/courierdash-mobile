import { useContext } from 'react';
import { WorkShiftEditContext, type WorkShiftEditContextValue } from '../provider/workShiftEditContext';
export function useWorkShiftEdit(): WorkShiftEditContextValue { const value = useContext(WorkShiftEditContext); if (value === null) throw new Error('useWorkShiftEdit must be used within WorkShiftEditProvider'); return value; }
