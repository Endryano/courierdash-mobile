import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockRetry = jest.fn<() => Promise<void>>();

jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => ({ retry: mockRetry }) }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));

const { ProfileNavigationBoundary } = require('@/features/navigation/ProfileNavigationBoundary') as typeof import('@/features/navigation/ProfileNavigationBoundary');

function renderBoundary(kind: 'recoverable_error' | 'blocked') {
  return render(<ThemeProvider><ProfileNavigationBoundary kind={kind} /></ThemeProvider>);
}

describe('ProfileNavigationBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
  });

  test('retries once and prevents a duplicate retry while pending', async () => {
    let resolveRetry: (() => void) | undefined;
    mockRetry.mockReturnValue(new Promise((resolve) => { resolveRetry = resolve; }));
    await renderBoundary('recoverable_error');

    await fireEvent.press(screen.getByTestId('profile-navigation-retry'));
    await fireEvent.press(screen.getByTestId('profile-navigation-retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('profile-navigation-retry').props.accessibilityState).toEqual({ disabled: true });
    expect(screen.getByText('navigation.retrying')).toBeTruthy();

    await act(async () => { resolveRetry?.(); });

    expect(screen.getByTestId('profile-navigation-retry').props.accessibilityState).toEqual({ disabled: false });
    expect(screen.getByText('navigation.retry')).toBeTruthy();
  });

  test('keeps pending presentation until an invalidated provider retry settles', async () => {
    let resolveRetry: (() => void) | undefined;
    mockRetry.mockReturnValue(new Promise((resolve) => { resolveRetry = resolve; }));
    await renderBoundary('recoverable_error');

    await fireEvent.press(screen.getByTestId('profile-navigation-retry'));
    expect(screen.getByText('navigation.retrying')).toBeTruthy();

    await act(async () => { resolveRetry?.(); });

    expect(screen.getByText('navigation.retry')).toBeTruthy();
    expect(screen.getByTestId('profile-navigation-retry').props.accessibilityState).toEqual({ disabled: false });
  });

  test('renders a safe blocked boundary with no automatic logout', async () => {
    await renderBoundary('blocked');

    expect(screen.getByText('navigation.blocked.title')).toBeTruthy();
    expect(screen.queryByText('network_unavailable')).toBeNull();
    expect(screen.queryByText('logout')).toBeNull();
  });
});
