import { Stack } from 'expo-router';

import { WorkShiftsProvider } from '@/features/work/provider/WorkShiftsProvider';
import { WorkShiftCreateProvider } from '@/features/work/provider/WorkShiftCreateProvider';
import { WorkShiftEditProvider } from '@/features/work/provider/WorkShiftEditProvider';
import { WorkShiftDeleteProvider } from '@/features/work/provider/WorkShiftDeleteProvider';

export default function AppLayout() {
  return (
    <WorkShiftsProvider>
      <WorkShiftCreateProvider>
        <WorkShiftEditProvider>
          <WorkShiftDeleteProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="statistics" />
              <Stack.Screen name="work/create" />
              <Stack.Screen name="work/[id]/edit" />
            </Stack>
          </WorkShiftDeleteProvider>
        </WorkShiftEditProvider>
      </WorkShiftCreateProvider>
    </WorkShiftsProvider>
  );
}
