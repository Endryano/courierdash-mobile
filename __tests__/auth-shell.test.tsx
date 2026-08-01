import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { AuthShell } from '@/features/auth/AuthShell';
import { AppText } from '@/components/ui/AppText';
import { ThemeProvider } from '@/theme/ThemeProvider';

function renderShell(onModeChange = jest.fn()) {
  return render(
    <ThemeProvider>
      <AuthShell activeMode="login" brand="CourierDash" loginLabel="Sign in" onModeChange={onModeChange} signupLabel="Sign up" title="Welcome">
        <AppText>Form content</AppText>
      </AuthShell>
    </ThemeProvider>,
  );
}

describe('AuthShell', () => {
  test('renders text branding, localized caller labels, card content, and selected mode semantics', async () => {
    await renderShell();
    expect(screen.getByText('CourierDash')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
    expect(screen.getByText('Sign up')).toBeTruthy();
    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByText('Form content')).toBeTruthy();
    expect(screen.getByTestId('auth-card')).toBeTruthy();
    expect(screen.getByTestId('auth-mode-login').props.accessibilityState).toEqual({ selected: true });
  });

  test('delegates mode navigation through the caller callback', async () => {
    const onModeChange = jest.fn();
    await renderShell(onModeChange);
    await fireEvent.press(screen.getByTestId('auth-mode-signup'));
    expect(onModeChange).toHaveBeenCalledWith('signup');
  });
});
