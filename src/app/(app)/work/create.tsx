import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { WorkShiftCreateForm } from '@/features/work/components/WorkShiftCreateForm';

export default function WorkShiftCreateRoute() {
  const router = useRouter();
  const returnToWork = useCallback(() => {
    router.replace('/work');
  }, [router]);

  return <WorkShiftCreateForm onCancel={returnToWork} />;
}
