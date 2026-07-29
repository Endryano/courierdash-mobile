import { Stack } from 'expo-router';

import { WorkShiftsProvider } from '@/features/work/provider/WorkShiftsProvider';
import { WorkShiftCreateProvider } from '@/features/work/provider/WorkShiftCreateProvider';
import { WorkShiftEditProvider } from '@/features/work/provider/WorkShiftEditProvider';

export default function AppLayout() {
  return <WorkShiftsProvider><WorkShiftCreateProvider><WorkShiftEditProvider><Stack screenOptions={{ headerShown: false }} /></WorkShiftEditProvider></WorkShiftCreateProvider></WorkShiftsProvider>;
}
