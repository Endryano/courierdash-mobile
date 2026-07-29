import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useProfile } from '@/features/profile/useProfile';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

// Temporary protected destination; product features are intentionally not implemented here.
export default function AuthenticatedPlaceholderScreen() {
  const { profile } = useProfile();
  const { t } = useLocalization();
  const { spacing } = useTheme();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <AppText variant="title">{t('app.placeholder.title')}</AppText>
        {profile?.nickname ? <AppText muted>{t('app.placeholder.nickname')}</AppText> : null}
      </View>
    </Screen>
  );
}
