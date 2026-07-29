import { useContext } from 'react'; import { WorkShiftDeleteContext, type WorkShiftDeleteContextValue } from '../provider/workShiftDeleteContext';
export function useWorkShiftDelete():WorkShiftDeleteContextValue{const value=useContext(WorkShiftDeleteContext);if(value===null)throw new Error('useWorkShiftDelete must be used within WorkShiftDeleteProvider');return value;}
