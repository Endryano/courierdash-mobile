import { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { WorkShiftEditForm } from '@/features/work/components/WorkShiftEditForm';
import { useWorkShiftEdit } from '@/features/work/hooks/useWorkShiftEdit';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

function parseWorkShiftId(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export default function WorkShiftEditRoute() {
  const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
  const shiftId = useMemo(() => parseWorkShiftId(rawId), [rawId]);
  const { load, reset } = useWorkShiftEdit();
  const router = useRouter();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const returnToWork = useCallback(() => {
    router.replace('/work');
  }, [router]);
  const returnFromInvalidRoute = useCallback(() => {
    reset();
    router.replace('/work');
  }, [reset, router]);

  useEffect(() => {
    if (shiftId !== null) void load(shiftId);
  }, [load, shiftId]);

  if (shiftId === null) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
          <AppText accessibilityRole="alert" variant="title">{t('work.edit.notFound')}</AppText>
          <AppButton label={t('navigation.backToWork')} onPress={returnFromInvalidRoute} />
        </View>
      </Screen>
    );
  }

  return <WorkShiftEditForm onCancel={returnToWork} />;
}
