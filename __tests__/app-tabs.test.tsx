import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockPush = jest.fn();
const mockSignOut = jest.fn<() => Promise<void>>();
let capturedScreenOptions: Record<string, unknown> | undefined;
const registeredTabs: string[] = [];
const tabLabels = {
  en: { 'navigation.tab.dashboard': 'Dashboard', 'navigation.tab.work': 'Work', 'navigation.tab.more': 'More' },
  pl: { 'navigation.tab.dashboard': 'Pulpit', 'navigation.tab.work': 'Zmiany', 'navigation.tab.more': 'Więcej' },
  ru: { 'navigation.tab.dashboard': 'Панель', 'navigation.tab.work': 'Смены', 'navigation.tab.more': 'Больше' },
  uk: { 'navigation.tab.dashboard': 'Панель', 'navigation.tab.work': 'Зміни', 'navigation.tab.more': 'Більше' },
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
  Tabs.Screen = ({ name, options }: { name: string; options: { title: string; tabBarAccessibilityLabel: string } }) => {
    registeredTabs.push(name);
    return React.createElement(Text, { accessibilityLabel: options.tabBarAccessibilityLabel }, `${name}:${options.title}`);
  };
  return { Tabs, router: { push: mockPush } };
});
jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({ t: (key: keyof typeof tabLabels.en) => tabLabels[mockLocale][key] ?? key }),
}));
jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => ({ signOut: mockSignOut, user: { email: 'courier@example.com' } }) }));
jest.mock('@/features/auth/authApi', () => ({ AuthApiError: MockAuthApiError }));
jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => ({ profile: { nickname: 'Courier_1' } }) }));

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
    mockLocale = 'en';
    mockSignOut.mockResolvedValue(undefined);
  });
  test('registers localized Dashboard, Work, and More tabs in the approved order', async () => {
    await renderTabs();

    expect(registeredTabs).toEqual(['index', 'work', 'more']);
    expect(screen.getByText('index:Dashboard')).toBeTruthy();
    expect(screen.getByText('work:Work')).toBeTruthy();
    expect(screen.getByText('more:More')).toBeTruthy();
    expect(registeredTabs).not.toContain('statistics');
    expect(registeredTabs).not.toContain('work/create');
    expect(registeredTabs).not.toContain('work/[id]/edit');
    expect(registeredTabs).not.toContain('annual-report');
  });

  test('uses built-in navigator presentation with semantic dark tab styling and no icons', async () => {
    await renderTabs();

    expect(capturedScreenOptions).toMatchObject({
      headerShown: false,
      tabBarActiveBackgroundColor: '#252530',
      tabBarActiveTintColor: '#00e5ff',
      tabBarInactiveTintColor: '#a0a0a0',
      tabBarItemStyle: { borderRadius: 12, marginHorizontal: 8, marginVertical: 8, minHeight: 48 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500', lineHeight: 16, textTransform: 'none' },
      tabBarStyle: { backgroundColor: '#1e1e24', borderTopColor: '#2c2c38', borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, shadowOpacity: 0 },
    });
    expect(capturedScreenOptions?.tabBar).toBeUndefined();
    expect(capturedScreenOptions?.tabBarIcon).toBeUndefined();
    expect(capturedScreenOptions?.tabBarShowLabel).not.toBe(false);
  });

  test.each([
    ['pl', 'Pulpit', 'Zmiany', 'Więcej'],
    ['uk', 'Панель', 'Зміни', 'Більше'],
    ['en', 'Dashboard', 'Work', 'More'],
    ['ru', 'Панель', 'Смены', 'Больше'],
  ] as [keyof typeof tabLabels, string, string, string][])('renders localized labels for %s', async (locale, dashboard, work, more) => {
    mockLocale = locale;
    await renderTabs();

    expect(screen.getByText(`index:${dashboard}`)).toBeTruthy();
    expect(screen.getByText(`work:${work}`)).toBeTruthy();
    expect(screen.getByText(`more:${more}`)).toBeTruthy();
  });

  test('updates tab labels after a localization rerender without custom navigation state', async () => {
    const view = await renderTabs();
    expect(screen.getByText('index:Dashboard')).toBeTruthy();

    mockLocale = 'uk';
    await view.rerender(<ThemeProvider><AppTabsLayout /></ThemeProvider>);

    expect(screen.getByText('index:Панель')).toBeTruthy();
    expect(screen.getByText('work:Зміни')).toBeTruthy();
    expect(screen.getByText('more:Більше')).toBeTruthy();
  });

  test('keeps More as a localized account screen and opens the protected Statistics route', async () => {
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    expect(screen.getByText('navigation.more.title')).toBeTruthy();
    expect(screen.getByText('navigation.more.account')).toBeTruthy();
    expect(screen.queryByText('navigation.more.description')).toBeNull();
    await fireEvent.press(screen.getByTestId('more-statistics'));
    expect(mockPush).toHaveBeenCalledWith('/statistics');
  });

  test('shows Logout in More, blocks repeat presses, and leaves navigation to the gate', async () => {
    let resolveSignOut: (() => void) | undefined;
    mockSignOut.mockReturnValue(new Promise((resolve) => { resolveSignOut = () => resolve(); }));
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    await fireEvent.press(screen.getByTestId('more-logout'));
    await fireEvent.press(screen.getByTestId('more-logout'));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('more-logout').props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => { resolveSignOut?.(); });
  });

  test('shows safe Logout failure copy without raw backend text', async () => {
    const rawError = 'access_token=secret refresh_token=secret';
    mockSignOut.mockRejectedValue(new MockAuthApiError('auth.error.network'));
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    await fireEvent.press(screen.getByTestId('more-logout'));

    expect(await screen.findByText('auth.error.network')).toBeTruthy();
    expect(screen.queryByText(rawError)).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
