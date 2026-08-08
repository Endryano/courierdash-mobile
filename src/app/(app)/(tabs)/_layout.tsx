import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

type TabBarLabelProps = {
  readonly color: ColorValue;
  readonly focused: boolean;
  readonly label: string;
};

function TabBarLabel({ color, focused, label }: TabBarLabelProps) {
  return <Text style={{ color, fontSize: 12, fontWeight: focused ? '700' : '500', lineHeight: 16 }}>{label}</Text>;
}

type TabBarIconProps = {
  readonly color: ColorValue;
  readonly name: React.ComponentProps<typeof Ionicons>['name'];
  readonly size: number;
};

function TabBarIcon({ color, name, size }: TabBarIconProps) {
  return <Ionicons color={color as string} name={name} size={size} />;
}

export default function AppTabsLayout() {
  const { t } = useLocalization();
  const { colors, spacing, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: {
          minHeight: 48,
          paddingVertical: spacing.xxs,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize,
          fontWeight: '500',
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
      <Tabs.Screen name="index" options={{ title: t('navigation.tab.dashboard'), tabBarAccessibilityLabel: t('navigation.tab.dashboard'), tabBarIcon: (props) => <TabBarIcon {...props} name="bar-chart-outline" />, tabBarLabel: (props) => <TabBarLabel {...props} label={t('navigation.tab.dashboard')} /> }} />
      <Tabs.Screen name="work" options={{ title: t('navigation.tab.work'), tabBarAccessibilityLabel: t('navigation.tab.work'), tabBarIcon: (props) => <TabBarIcon {...props} name="time-outline" />, tabBarLabel: (props) => <TabBarLabel {...props} label={t('navigation.tab.work')} /> }} />
      <Tabs.Screen name="more" options={{ title: t('navigation.tab.more'), tabBarAccessibilityLabel: t('navigation.tab.more'), tabBarIcon: (props) => <TabBarIcon {...props} name="ellipsis-horizontal-outline" />, tabBarLabel: (props) => <TabBarLabel {...props} label={t('navigation.tab.more')} /> }} />
    </Tabs>
  );
}
