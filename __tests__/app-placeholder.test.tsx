import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockProfile = { status: 'ready' as const, profile: { id: 'user-1', nickname: 'Courier_1' }, retry: jest.fn(), subjectUserId: 'user-1' };

jest.mock('@/features/profile/useProfile', () => ({ useProfile: () => mockProfile }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));

const AuthenticatedPlaceholderScreen = require('@/app/(app)/index').default as typeof import('@/app/(app)/index').default;

describe('AuthenticatedPlaceholderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders only the temporary authenticated placeholder', async () => {
    await render(<ThemeProvider><AuthenticatedPlaceholderScreen /></ThemeProvider>);

    expect(screen.getByText('app.placeholder.title')).toBeTruthy();
    expect(screen.queryByText('foundation.title')).toBeNull();
  });
});
