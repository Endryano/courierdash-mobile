import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

const mockDashboardContent = jest.fn(() => null);

jest.mock('@/features/dashboard/components/DashboardContent', () => ({ DashboardContent: mockDashboardContent }));

const DashboardRoute = require('@/app/(app)/(tabs)/index').default as typeof import('@/app/(app)/(tabs)/index').default;

describe('DashboardRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('delegates the protected route to the Dashboard content', async () => {
    await render(<DashboardRoute />);

    expect(mockDashboardContent).toHaveBeenCalledTimes(1);
  });
});
