import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { supportedLocales } from '@/i18n/translations';
import { useTheme } from '@/theme/ThemeProvider';

export default function Index() {
  const { locale, setLocale, t } = useLocalization();
  const { spacing } = useTheme();

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={[styles.content, { gap: spacing.md }]}>
        <AppText variant="title">{t('foundation.title')}</AppText>
        <AppText muted>{t('foundation.description')}</AppText>
        <AppButton label={t('auth.login')} onPress={() => router.push('/login')} testID="home-login" />
        <AppButton label={t('auth.signup')} onPress={() => router.push('/signup')} testID="home-signup" />
        <View style={{ gap: spacing.xs, marginTop: spacing.lg }}>
          <AppText variant="label">{t('foundation.languageLabel')}</AppText>
          {supportedLocales.map((supportedLocale) => (
            <AppButton
              disabled={locale === supportedLocale}
              key={supportedLocale}
              label={t(`language.${supportedLocale}`)}
              onPress={() => void setLocale(supportedLocale)}
              testID={`locale-${supportedLocale}`}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
