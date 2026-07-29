import { Stack } from 'expo-router';

import { WorkShiftsProvider } from '@/features/work/provider/WorkShiftsProvider';
import { WorkShiftCreateProvider } from '@/features/work/provider/WorkShiftCreateProvider';

export default function AppLayout() {
  return <WorkShiftsProvider><WorkShiftCreateProvider><Stack screenOptions={{ headerShown: false }} /></WorkShiftCreateProvider></WorkShiftsProvider>;
}
