import { Stack } from 'expo-router';

import { WorkShiftsProvider } from '@/features/work/provider/WorkShiftsProvider';

export default function AppLayout() {
  return <WorkShiftsProvider><Stack screenOptions={{ headerShown: false }} /></WorkShiftsProvider>;
}
