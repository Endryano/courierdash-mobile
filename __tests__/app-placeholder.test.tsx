import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

const mockDashboardContent = jest.fn(() => null);

jest.mock('@/features/dashboard/components/DashboardContent', () => ({ DashboardContent: mockDashboardContent }));

const AuthenticatedPlaceholderScreen = require('@/app/(app)/index').default as typeof import('@/app/(app)/index').default;

describe('AuthenticatedPlaceholderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('delegates the protected route to the Dashboard content', async () => {
    await render(<AuthenticatedPlaceholderScreen />);

    expect(mockDashboardContent).toHaveBeenCalledTimes(1);
  });
});
