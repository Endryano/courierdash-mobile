import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';
import type { ValidNickname } from '@/features/profile/profileTypes';

const mockSaveOwnNickname = jest.fn<(userId: string, nickname: ValidNickname) => Promise<void>>();
const mockRetry = jest.fn<() => Promise<void>>();
const mockMapNicknameError = jest.fn<(error: unknown) => string>();
const mockAuth = { user: { id: 'user-1' } };

jest.mock('@/features/auth/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => ({ status: 'needs_nickname', retry: mockRetry }) }));
jest.mock('@/features/profile/nicknameApi', () => ({ saveOwnNickname: mockSaveOwnNickname }));
jest.mock('@/features/profile/nicknameError', () => ({ mapNicknameError: mockMapNicknameError }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));

const { NicknameOnboardingScreen } = require('@/features/profile/NicknameOnboardingScreen') as typeof import('@/features/profile/NicknameOnboardingScreen');

function renderScreen() {
  return render(<ThemeProvider><NicknameOnboardingScreen /></ThemeProvider>);
}

describe('NicknameOnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveOwnNickname.mockResolvedValue(undefined);
    mockRetry.mockResolvedValue(undefined);
    mockMapNicknameError.mockReturnValue('profile.nickname.error.unknown');
  });

  test('renders the onboarding form and rejects invalid input without saving', async () => {
    await renderScreen();

    expect(screen.getByText('profile.nickname.title')).toBeTruthy();
    expect(screen.getByTestId('nickname-input')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('nickname-save'));

    expect(await screen.findByText('profile.nickname.error.required')).toBeTruthy();
    expect(mockSaveOwnNickname).not.toHaveBeenCalled();
  });

  test('saves a trimmed nickname, disables while saving, and retries exactly once', async () => {
    let resolveSave: (() => void) | undefined;
    mockSaveOwnNickname.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('nickname-input'), ' Courier_1 ');
    await waitFor(() => expect(screen.getByTestId('nickname-input').props.value).toBe(' Courier_1 '));
    await fireEvent.press(screen.getByTestId('nickname-save'));

    expect(mockSaveOwnNickname).toHaveBeenCalledWith('user-1', 'Courier_1');
    expect(screen.getByTestId('nickname-save').props.accessibilityState).toEqual({ disabled: true });

    await act(async () => { resolveSave?.(); });

    await waitFor(() => expect(mockRetry).toHaveBeenCalledTimes(1));
    expect(screen.getByText('profile.nickname.title')).toBeTruthy();
  });

  test('shows a safe conflict error and does not retry after a failed save', async () => {
    mockSaveOwnNickname.mockRejectedValue(new Error('raw database failure'));
    mockMapNicknameError.mockReturnValue('profile.nickname.error.conflict');
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('nickname-input'), 'Courier_1');
    await fireEvent.press(screen.getByTestId('nickname-save'));

    expect(await screen.findByText('profile.nickname.error.conflict')).toBeTruthy();
    expect(mockRetry).not.toHaveBeenCalled();
    expect(screen.queryByText('raw database failure')).toBeNull();
  });

  test('shows a safe network error without retrying', async () => {
    mockSaveOwnNickname.mockRejectedValue(new Error('raw network failure'));
    mockMapNicknameError.mockReturnValue('profile.nickname.error.network');
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('nickname-input'), 'Courier_1');
    await fireEvent.press(screen.getByTestId('nickname-save'));

    expect(await screen.findByText('profile.nickname.error.network')).toBeTruthy();
    expect(mockRetry).not.toHaveBeenCalled();
  });

  test('submits from the return key', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByTestId('nickname-input'), 'Courier_1');
    await fireEvent(screen.getByTestId('nickname-input'), 'submitEditing');

    await waitFor(() => expect(mockSaveOwnNickname).toHaveBeenCalledWith('user-1', 'Courier_1'));
  });

  test('does not update state after unmounting during a save', async () => {
    let resolveSave: (() => void) | undefined;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockSaveOwnNickname.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    const view = await renderScreen();

    await fireEvent.changeText(screen.getByTestId('nickname-input'), 'Courier_1');
    await fireEvent.press(screen.getByTestId('nickname-save'));
    await view.unmount();
    resolveSave?.();
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
