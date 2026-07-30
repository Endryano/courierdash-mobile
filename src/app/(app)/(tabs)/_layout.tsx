import { Tabs } from 'expo-router';

import { useLocalization } from '@/i18n/LocalizationProvider';

export default function AppTabsLayout() {
  const { t } = useLocalization();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('navigation.tab.dashboard'), tabBarAccessibilityLabel: t('navigation.tab.dashboard') }} />
      <Tabs.Screen name="work" options={{ title: t('navigation.tab.work'), tabBarAccessibilityLabel: t('navigation.tab.work') }} />
      <Tabs.Screen name="more" options={{ title: t('navigation.tab.more'), tabBarAccessibilityLabel: t('navigation.tab.more') }} />
    </Tabs>
  );
}
