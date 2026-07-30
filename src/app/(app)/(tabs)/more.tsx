import { View } from 'react-native';

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
      </View>
    </Screen>
  );
}
