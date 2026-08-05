import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockPush = jest.fn();
const mockSignOut = jest.fn<() => Promise<void>>();
let mockEmail: string | undefined;
let mockNickname: string | null = 'Courier_1';
let mockLocale = 'en';

const localeLabels = {
  en: { 'navigation.more.title': 'More', 'navigation.more.account': 'Account', 'navigation.more.analytics': 'Analytics', 'navigation.more.statistics': 'Statistics', 'auth.logout': 'Log out', 'auth.loading': 'Loading…' },
  uk: { 'navigation.more.title': 'Більше', 'navigation.more.account': 'Обліковий запис', 'navigation.more.analytics': 'Аналітика', 'navigation.more.statistics': 'Статистика', 'auth.logout': 'Вийти', 'auth.loading': 'Завантаження…' },
} as const;

class MockAuthApiError extends Error {
  constructor(readonly key: string) {
    super('Auth request failed.');
  }
}

jest.mock('expo-router', () => ({ router: { push: mockPush } }));
jest.mock('@/features/auth/authApi', () => ({ AuthApiError: MockAuthApiError }));
jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => ({ signOut: mockSignOut, user: mockEmail === undefined ? null : { email: mockEmail, id: 'internal-user-id', user_metadata: { private: 'metadata' } } }) }));
jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => ({ profile: mockNickname === null ? null : { id: 'profile-id', nickname: mockNickname } }) }));
jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({
    t: (key: keyof typeof localeLabels.en) => localeLabels[mockLocale as keyof typeof localeLabels][key] ?? key,
  }),
}));

const MoreRoute = require('@/app/(app)/(tabs)/more').default as typeof import('@/app/(app)/(tabs)/more').default;

function renderMore() {
  return render(<ThemeProvider><MoreRoute /></ThemeProvider>);
}

describe('MoreRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmail = 'courier@example.com';
    mockNickname = 'Courier_1';
    mockLocale = 'en';
    mockSignOut.mockResolvedValue(undefined);
  });

  test('renders canonical nickname and a safe optional email in logical order', async () => {
    await renderMore();

    expect(screen.getByRole('header', { name: 'More' })).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('Courier_1')).toBeTruthy();
    expect(screen.getByText('courier@example.com')).toBeTruthy();
  });

  test.each([undefined, '', '   '])('omits a missing or blank email without inventing a fallback', async (email) => {
    mockEmail = email;
    await renderMore();

    expect(screen.getByText('Courier_1')).toBeTruthy();
    expect(screen.queryByText('courier@example.com')).toBeNull();
  });

  test('does not render internal identity, metadata, or session-like values', async () => {
    await renderMore();

    expect(screen.queryByText('internal-user-id')).toBeNull();
    expect(screen.queryByText('profile-id')).toBeNull();
    expect(screen.queryByText('metadata')).toBeNull();
    expect(screen.queryByText('access_token')).toBeNull();
  });

  test('keeps long nickname and email present without using the email local-part as identity', async () => {
    mockNickname = 'Courier_With_A_Long_Canonical_Nickname';
    mockEmail = 'long.account.identifier@example.com';
    await renderMore();

    expect(screen.getByText('Courier_With_A_Long_Canonical_Nickname')).toBeTruthy();
    expect(screen.getByText('long.account.identifier@example.com')).toBeTruthy();
    expect(screen.queryByText('long.account.identifier')).toBeNull();
  });

  test('uses the exact protected Statistics route and no unsupported actions', async () => {
    await renderMore();

    const statistics = screen.getByTestId('more-statistics');
    expect(statistics.props.accessibilityRole).toBe('button');
    await fireEvent.press(statistics);

    expect(mockPush).toHaveBeenCalledWith('/statistics');
    expect(screen.queryByText(/Annual Report/i)).toBeNull();
    expect(screen.queryByText(/Settings/i)).toBeNull();
  });

  test('updates More labels after a localization rerender', async () => {
    const view = await renderMore();
    expect(screen.getByText('Account')).toBeTruthy();

    mockLocale = 'uk';
    await view.rerender(<ThemeProvider><MoreRoute /></ThemeProvider>);

    expect(screen.getByText('Обліковий запис')).toBeTruthy();
    expect(screen.getByText('Аналітика')).toBeTruthy();
  });

  test('keeps provider-owned logout pending, safe failure, and retry behavior', async () => {
    const rawFailure = 'access_token=secret refresh_token=secret';
    mockSignOut.mockRejectedValueOnce(new MockAuthApiError('auth.error.network')).mockResolvedValueOnce(undefined);
    await renderMore();

    await fireEvent.press(screen.getByTestId('more-logout'));
    expect(await screen.findByText('auth.error.network')).toBeTruthy();
    expect(screen.queryByText(rawFailure)).toBeNull();

    await fireEvent.press(screen.getByTestId('more-logout'));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(2));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('disables and marks Logout busy while a request is pending', async () => {
    let resolveSignOut: (() => void) | undefined;
    mockSignOut.mockReturnValue(new Promise((resolve) => { resolveSignOut = resolve; }));
    await renderMore();

    await fireEvent.press(screen.getByTestId('more-logout'));
    await fireEvent.press(screen.getByTestId('more-logout'));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('more-logout').props.accessibilityState).toEqual({ disabled: true, busy: true });

    await act(async () => { resolveSignOut?.(); });
  });
});
