import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';
import type { Session } from '@supabase/supabase-js';
import type { SignInInput } from '@/features/auth/authValidation';

const mockSignInWithEmail = jest.fn<(input: SignInInput) => Promise<Session | null>>();
const mockRouterPush = jest.fn();

class mockAuthApiError extends Error {
  constructor(readonly key: string) {
    super('Auth request failed.');
  }
}

jest.mock('@/features/auth/authApi', () => ({
  AuthApiError: mockAuthApiError,
  signInWithEmail: mockSignInWithEmail,
}));

jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => ({
  router: { push: mockRouterPush },
}));

const LoginScreen = require('@/app/(auth)/login').default as typeof import('@/app/(auth)/login').default;

function renderLogin() {
  return render(
    <ThemeProvider>
      <LoginScreen />
    </ThemeProvider>,
  );
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithEmail.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders fields and rejects invalid input without calling the API', async () => {
    await renderLogin();

    expect(screen.getByTestId('login-email')).toBeTruthy();
    expect(screen.getByTestId('login-password')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect((await screen.findAllByText('auth.required')).length).toBe(2);
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  test('submits valid input once, disables while pending, and clears password on success', async () => {
    let resolveRequest: (() => void) | undefined;
    mockSignInWithEmail.mockReturnValue(new Promise((resolve) => { resolveRequest = () => resolve(null); }));
    await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'courier@example.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), ' secret ');
    await waitFor(() => expect(screen.getByTestId('login-email').props.value).toBe('courier@example.com'));
    await waitFor(() => expect(screen.getByTestId('login-password').props.value).toBe(' secret '));
    await fireEvent.press(screen.getByTestId('login-submit'));
    await fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(mockSignInWithEmail).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('login-submit').props.accessibilityState).toEqual({ disabled: true, busy: true });

    await act(async () => { resolveRequest?.(); });

    await waitFor(() => expect(screen.getByTestId('login-password').props.value).toBe(''));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('shows a localized safe error instead of raw backend content', async () => {
    const rawMessage = 'password=secret access_token=token';
    mockSignInWithEmail.mockRejectedValue(new mockAuthApiError('auth.error.invalidCredentials'));
    await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'courier@example.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'secret');
    await waitFor(() => expect(screen.getByTestId('login-password').props.value).toBe('secret'));
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('auth.error.invalidCredentials')).toBeTruthy();
    expect(screen.queryByText(rawMessage)).toBeNull();
  });

  test('opens the canonical signup route from the Auth mode switch', async () => {
    await renderLogin();

    await fireEvent.press(screen.getByTestId('auth-mode-signup'));

    expect(mockRouterPush).toHaveBeenCalledWith('/signup');
  });

  test('preserves native credential metadata and does not render password recovery', async () => {
    await renderLogin();

    expect(screen.getByTestId('login-email').props.autoComplete).toBe('email');
    expect(screen.getByTestId('login-password').props.autoComplete).toBe('current-password');
    expect(screen.getByTestId('login-password').props.secureTextEntry).toBe(true);
    expect(screen.queryByText(/forgot|reset|recovery/i)).toBeNull();
  });

  test('does not update state after unmounting with a pending request', async () => {
    let resolveRequest: (() => void) | undefined;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockSignInWithEmail.mockReturnValue(new Promise((resolve) => { resolveRequest = () => resolve(null); }));
    const result = await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'courier@example.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'secret');
    await waitFor(() => expect(screen.getByTestId('login-password').props.value).toBe('secret'));
    await fireEvent.press(screen.getByTestId('login-submit'));
    await result.unmount();
    resolveRequest?.();
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
