import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

const mockWorkShiftsPlaceholder = jest.fn(() => null);

jest.mock('@/features/work/components/WorkShiftsPlaceholder', () => ({ WorkShiftsPlaceholder: mockWorkShiftsPlaceholder }));

const AuthenticatedPlaceholderScreen = require('@/app/(app)/index').default as typeof import('@/app/(app)/index').default;

describe('AuthenticatedPlaceholderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('delegates the protected route to the Work shifts placeholder', async () => {
    await render(<AuthenticatedPlaceholderScreen />);

    expect(mockWorkShiftsPlaceholder).toHaveBeenCalledTimes(1);
  });
});
