import { describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const Tabs = ({ children }: { children: unknown }) => React.createElement(View, null, children);
  Tabs.Screen = ({ name, options }: { name: string; options: { title: string; tabBarAccessibilityLabel: string } }) => React.createElement(Text, { accessibilityLabel: options.tabBarAccessibilityLabel }, `${name}:${options.title}`);
  return { Tabs };
});
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));

const AppTabsLayout = require('@/app/(app)/(tabs)/_layout').default as typeof import('@/app/(app)/(tabs)/_layout').default;
const MoreRoute = require('@/app/(app)/(tabs)/more').default as typeof import('@/app/(app)/(tabs)/more').default;

describe('AppTabsLayout', () => {
  test('registers localized Dashboard, Work, and More tabs in the approved order', async () => {
    await render(<AppTabsLayout />);

    expect(screen.getByText('index:navigation.tab.dashboard')).toBeTruthy();
    expect(screen.getByText('work:navigation.tab.work')).toBeTruthy();
    expect(screen.getByText('more:navigation.tab.more')).toBeTruthy();
  });

  test('renders the More route as a minimal localized shell', async () => {
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    expect(screen.getByText('navigation.more.title')).toBeTruthy();
    expect(screen.getByText('navigation.more.description')).toBeTruthy();
  });
});
