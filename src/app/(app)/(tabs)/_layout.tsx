import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function AppTabsLayout() {
  const { t } = useLocalization();
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: colors.surfaceElevated,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: {
          borderRadius: radii.md,
          marginHorizontal: spacing.xs,
          marginVertical: spacing.xs,
          minHeight: 48,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize,
          fontWeight: typography.label.fontWeight,
          lineHeight: typography.caption.lineHeight,
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('navigation.tab.dashboard'), tabBarAccessibilityLabel: t('navigation.tab.dashboard') }} />
      <Tabs.Screen name="work" options={{ title: t('navigation.tab.work'), tabBarAccessibilityLabel: t('navigation.tab.work') }} />
      <Tabs.Screen name="more" options={{ title: t('navigation.tab.more'), tabBarAccessibilityLabel: t('navigation.tab.more') }} />
    </Tabs>
  );
}
