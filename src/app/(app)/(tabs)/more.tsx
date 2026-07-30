import { router } from 'expo-router';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function MoreRoute() {
  const { t } = useLocalization();
  const { spacing } = useTheme();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
        <AppText variant="title">{t('navigation.more.title')}</AppText>
        <AppText muted>{t('navigation.more.description')}</AppText>
        <AppButton label={t('navigation.more.statistics')} onPress={() => router.push('/statistics')} testID="more-statistics" />
      </View>
    </Screen>
  );
}
