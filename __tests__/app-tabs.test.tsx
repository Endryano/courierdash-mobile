import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockSignOut = jest.fn<() => Promise<void>>();
let capturedScreenOptions: Record<string, unknown> | undefined;
const registeredTabs: string[] = [];
const mockTabOptions = new Map<string, Record<string, unknown>>();
const tabLabels = {
  en: { 'navigation.tab.dashboard': 'Statistics', 'navigation.tab.work': 'Work', 'navigation.tab.more': 'More' },
  pl: { 'navigation.tab.dashboard': 'Statystyki', 'navigation.tab.work': 'Zmiany', 'navigation.tab.more': 'Więcej' },
  ru: { 'navigation.tab.dashboard': 'Статистика', 'navigation.tab.work': 'Смены', 'navigation.tab.more': 'Больше' },
  uk: { 'navigation.tab.dashboard': 'Статистика', 'navigation.tab.work': 'Зміни', 'navigation.tab.more': 'Більше' },
} as const;
let mockLocale: keyof typeof tabLabels = 'en';

class MockAuthApiError extends Error {
  constructor(readonly key: string) {
    super('Auth request failed.');
  }
}

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const Tabs = ({ children, screenOptions }: { children: unknown; screenOptions: Record<string, unknown> }) => {
    capturedScreenOptions = screenOptions;
    return React.createElement(View, null, children);
  };
  Tabs.Screen = ({ name, options }: { name: string; options: Record<string, unknown> & { title: string; tabBarAccessibilityLabel: string } }) => {
    registeredTabs.push(name);
    mockTabOptions.set(name, options);
    return React.createElement(Text, { accessibilityLabel: options.tabBarAccessibilityLabel }, `${name}:${options.title}`);
  };
  return { Tabs };
});
jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({ t: (key: keyof typeof tabLabels.en) => tabLabels[mockLocale][key] ?? key }),
}));
jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => ({ signOut: mockSignOut, user: { email: 'courier@example.com' } }) }));
jest.mock('@/features/auth/authApi', () => ({ AuthApiError: MockAuthApiError }));
jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => ({ profile: { nickname: 'Courier_1' } }) }));
jest.mock('react-native-safe-area-context', () => ({
  ...(jest.requireActual('react-native-safe-area-context') as object),
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));

const AppTabsLayout = require('@/app/(app)/(tabs)/_layout').default as typeof import('@/app/(app)/(tabs)/_layout').default;
const MoreRoute = require('@/app/(app)/(tabs)/more').default as typeof import('@/app/(app)/(tabs)/more').default;

function renderTabs() {
  return render(<ThemeProvider><AppTabsLayout /></ThemeProvider>);
}

describe('AppTabsLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedScreenOptions = undefined;
    registeredTabs.length = 0;
    mockTabOptions.clear();
    mockLocale = 'en';
    mockSignOut.mockResolvedValue(undefined);
  });
  test('registers localized Dashboard, Work, and More tabs in the approved order', async () => {
    await renderTabs();

    expect(registeredTabs).toEqual(['index', 'work', 'more']);
    expect(screen.getByText('index:Statistics')).toBeTruthy();
    expect(screen.getByText('work:Work')).toBeTruthy();
    expect(screen.getByText('more:More')).toBeTruthy();
    expect(registeredTabs).not.toContain('statistics');
    expect(registeredTabs).not.toContain('work/create');
    expect(registeredTabs).not.toContain('work/[id]/edit');
    expect(registeredTabs).not.toContain('annual-report');
  });

  test('uses an integrated dark tab surface with semantic Ionicons', async () => {
    await renderTabs();

    expect(capturedScreenOptions).toMatchObject({
      headerShown: false,
      sceneStyle: { backgroundColor: '#121212' },
      tabBarActiveBackgroundColor: 'transparent',
      tabBarActiveTintColor: '#00e5ff',
      tabBarInactiveTintColor: '#a0a0a0',
      tabBarItemStyle: { minHeight: 48, paddingVertical: 4 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500', lineHeight: 16, textTransform: 'none' },
      tabBarStyle: { backgroundColor: '#1e1e24', borderTopColor: '#2c2c38', borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, shadowOpacity: 0 },
    });
    expect(capturedScreenOptions?.tabBar).toBeUndefined();
    expect(mockTabOptions.get('index')?.tabBarIcon).toEqual(expect.any(Function));
    expect(mockTabOptions.get('work')?.tabBarIcon).toEqual(expect.any(Function));
    expect(mockTabOptions.get('more')?.tabBarIcon).toEqual(expect.any(Function));
    const renderIcon = (tab: string) => (mockTabOptions.get(tab)?.tabBarIcon as (props: { color: string; focused: boolean; size: number }) => ReactElement<{ name: string }>)({ color: '#00e5ff', focused: true, size: 24 });
    expect(renderIcon('index').props.name).toBe('bar-chart-outline');
    expect(renderIcon('work').props.name).toBe('time-outline');
    expect(renderIcon('more').props.name).toBe('ellipsis-horizontal-outline');
    expect(capturedScreenOptions?.tabBarShowLabel).not.toBe(false);
  });

  test.each([
    ['pl', 'Statystyki', 'Zmiany', 'Więcej'],
    ['uk', 'Статистика', 'Зміни', 'Більше'],
    ['en', 'Statistics', 'Work', 'More'],
    ['ru', 'Статистика', 'Смены', 'Больше'],
  ] as [keyof typeof tabLabels, string, string, string][])('renders localized labels for %s', async (locale, dashboard, work, more) => {
    mockLocale = locale;
    await renderTabs();

    expect(screen.getByText(`index:${dashboard}`)).toBeTruthy();
    expect(screen.getByText(`work:${work}`)).toBeTruthy();
    expect(screen.getByText(`more:${more}`)).toBeTruthy();
  });

  test('updates tab labels after a localization rerender without custom navigation state', async () => {
    const view = await renderTabs();
    expect(screen.getByText('index:Statistics')).toBeTruthy();

    mockLocale = 'uk';
    await view.rerender(<ThemeProvider><AppTabsLayout /></ThemeProvider>);

    expect(screen.getByText('index:Статистика')).toBeTruthy();
    expect(screen.getByText('work:Зміни')).toBeTruthy();
    expect(screen.getByText('more:Більше')).toBeTruthy();
  });

  test('keeps More as a localized account screen without the removed legacy Statistics entry', async () => {
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    expect(screen.getByText('navigation.more.title')).toBeTruthy();
    expect(screen.getByText('navigation.more.account')).toBeTruthy();
    expect(screen.queryByText('navigation.more.description')).toBeNull();
    expect(screen.queryByTestId('more-statistics')).toBeNull();
    expect(screen.queryByText('navigation.more.analytics')).toBeNull();
  });

  test('shows Logout in More, blocks repeat presses, and leaves navigation to the gate', async () => {
    let resolveSignOut: (() => void) | undefined;
    mockSignOut.mockReturnValue(new Promise((resolve) => { resolveSignOut = () => resolve(); }));
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    await fireEvent.press(screen.getByTestId('more-logout'));
    await fireEvent.press(screen.getByTestId('more-logout'));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('more-logout').props.accessibilityState).toEqual({ disabled: true, busy: true });

    await act(async () => { resolveSignOut?.(); });
  });

  test('shows safe Logout failure copy without raw backend text', async () => {
    const rawError = 'access_token=secret refresh_token=secret';
    mockSignOut.mockRejectedValue(new MockAuthApiError('auth.error.network'));
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    await fireEvent.press(screen.getByTestId('more-logout'));

    expect(await screen.findByText('auth.error.network')).toBeTruthy();
    expect(screen.queryByText(rawError)).toBeNull();
  });
});
