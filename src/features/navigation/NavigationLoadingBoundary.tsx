import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

export function NavigationLoadingBoundary() {
  const { t } = useLocalization();
  const { colors, spacing } = useTheme();

  return (
    <Screen accessibilityLabel={t('navigation.loading')}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <ActivityIndicator color={colors.accent} />
        <AppText accessibilityRole="progressbar" muted>{t('navigation.loading')}</AppText>
      </View>
    </Screen>
  );
}
