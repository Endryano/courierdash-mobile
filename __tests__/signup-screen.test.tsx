import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { Session } from '@supabase/supabase-js';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';
import type { SignInInput } from '@/features/auth/authValidation';

const mockSignUpWithEmail = jest.fn<(input: SignInInput) => Promise<Session | null>>();
const mockRouterPush = jest.fn();

class mockAuthApiError extends Error {
  constructor(readonly key: string) {
    super('Auth request failed.');
  }
}

jest.mock('@/features/auth/authApi', () => ({
  AuthApiError: mockAuthApiError,
  signUpWithEmail: mockSignUpWithEmail,
}));

jest.mock('@/i18n/LocalizationProvider', () => ({
  useLocalization: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => ({
  router: { push: mockRouterPush },
}));

const SignupScreen = require('@/app/(auth)/signup').default as typeof import('@/app/(auth)/signup').default;

function renderSignup() {
  return render(
    <ThemeProvider>
      <SignupScreen />
    </ThemeProvider>,
  );
}

async function fillValidForm() {
  await fireEvent.changeText(screen.getByTestId('signup-email'), 'courier@example.com');
  await fireEvent.changeText(screen.getByTestId('signup-password'), ' secret ');
  await fireEvent.changeText(screen.getByTestId('signup-confirm-password'), ' secret ');
  await waitFor(() => expect(screen.getByTestId('signup-confirm-password').props.value).toBe(' secret '));
}

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUpWithEmail.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders fields and rejects a mismatched confirmation without calling the API', async () => {
    await renderSignup();

    expect(screen.getByTestId('signup-email')).toBeTruthy();
    await fillValidForm();
    await fireEvent.changeText(screen.getByTestId('signup-confirm-password'), 'different');
    await waitFor(() => expect(screen.getByTestId('signup-confirm-password').props.value).toBe('different'));
    await fireEvent.press(screen.getByTestId('signup-submit'));

    expect(await screen.findByText('auth.passwordMismatch')).toBeTruthy();
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  test('submits only email and password once while pending', async () => {
    let resolveRequest: (() => void) | undefined;
    mockSignUpWithEmail.mockReturnValue(new Promise((resolve) => { resolveRequest = () => resolve(null); }));
    await renderSignup();
    await fillValidForm();

    await fireEvent.press(screen.getByTestId('signup-submit'));
    await fireEvent.press(screen.getByTestId('signup-submit'));

    await waitFor(() => expect(mockSignUpWithEmail).toHaveBeenCalledTimes(1));
    expect(mockSignUpWithEmail).toHaveBeenCalledWith({ email: 'courier@example.com', password: ' secret ' });
    expect(mockSignUpWithEmail.mock.calls[0][0]).not.toHaveProperty('confirmPassword');
    expect(screen.getByTestId('signup-submit').props.accessibilityState).toEqual({ disabled: true });

    await act(async () => { resolveRequest?.(); });
    expect(await screen.findByText('auth.confirmEmail')).toBeTruthy();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('handles a returned session without redirect or profile work', async () => {
    mockSignUpWithEmail.mockResolvedValue({} as Session);
    await renderSignup();
    await fillValidForm();

    await fireEvent.press(screen.getByTestId('signup-submit'));

    expect(await screen.findByText('auth.signedUp')).toBeTruthy();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('shows a localized safe error instead of raw backend content', async () => {
    const rawMessage = 'refresh_token=secret session=payload';
    mockSignUpWithEmail.mockRejectedValue(new mockAuthApiError('auth.error.accountExists'));
    await renderSignup();
    await fillValidForm();

    await fireEvent.press(screen.getByTestId('signup-submit'));

    expect(await screen.findByText('auth.error.accountExists')).toBeTruthy();
    expect(screen.queryByText(rawMessage)).toBeNull();
  });

  test('opens the canonical login route', async () => {
    await renderSignup();

    await fireEvent.press(screen.getByTestId('go-login'));

    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  test('does not update state after unmounting with a pending request', async () => {
    let resolveRequest: (() => void) | undefined;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockSignUpWithEmail.mockReturnValue(new Promise((resolve) => { resolveRequest = () => resolve(null); }));
    const result = await renderSignup();
    await fillValidForm();
    await fireEvent.press(screen.getByTestId('signup-submit'));
    await result.unmount();
    resolveRequest?.();
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
