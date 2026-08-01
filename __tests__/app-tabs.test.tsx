import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockPush = jest.fn();
const mockSignOut = jest.fn<() => Promise<void>>();

class MockAuthApiError extends Error {
  constructor(readonly key: string) {
    super('Auth request failed.');
  }
}

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const Tabs = ({ children }: { children: unknown }) => React.createElement(View, null, children);
  Tabs.Screen = ({ name, options }: { name: string; options: { title: string; tabBarAccessibilityLabel: string } }) => React.createElement(Text, { accessibilityLabel: options.tabBarAccessibilityLabel }, `${name}:${options.title}`);
  return { Tabs, router: { push: mockPush } };
});
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));
jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => ({ signOut: mockSignOut }) }));
jest.mock('@/features/auth/authApi', () => ({ AuthApiError: MockAuthApiError }));

const AppTabsLayout = require('@/app/(app)/(tabs)/_layout').default as typeof import('@/app/(app)/(tabs)/_layout').default;
const MoreRoute = require('@/app/(app)/(tabs)/more').default as typeof import('@/app/(app)/(tabs)/more').default;

describe('AppTabsLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });
  test('registers localized Dashboard, Work, and More tabs in the approved order', async () => {
    await render(<AppTabsLayout />);

    expect(screen.getByText('index:navigation.tab.dashboard')).toBeTruthy();
    expect(screen.getByText('work:navigation.tab.work')).toBeTruthy();
    expect(screen.getByText('more:navigation.tab.more')).toBeTruthy();
  });

  test('keeps More as a localized shell and opens the protected Statistics route', async () => {
    await render(<ThemeProvider><MoreRoute /></ThemeProvider>);

    expect(screen.getByText('navigation.more.title')).toBeTruthy();
    expect(screen.getByText('navigation.more.description')).toBeTruthy();
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
