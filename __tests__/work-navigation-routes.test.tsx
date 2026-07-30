import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockReplace = jest.fn();
const mockLoad = jest.fn<() => Promise<void>>();
const mockReset = jest.fn();
let mockParams: { id?: string | string[] } = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('@/features/work/hooks/useWorkShiftEdit', () => ({
  useWorkShiftEdit: () => ({ load: mockLoad, reset: mockReset }),
}));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));
jest.mock('@/features/work/components/WorkShiftCreateForm', () => ({
  WorkShiftCreateForm: ({ onCancel }: { onCancel: () => void }) => {
    const React = require('react');
    const { Button } = require('react-native');
    return React.createElement(Button, { onPress: onCancel, testID: 'create-cancel', title: 'cancel' });
  },
}));
jest.mock('@/features/work/components/WorkShiftEditForm', () => ({
  WorkShiftEditForm: ({ onCancel }: { onCancel: () => void }) => {
    const React = require('react');
    const { Button } = require('react-native');
    return React.createElement(Button, { onPress: onCancel, testID: 'edit-cancel', title: 'cancel' });
  },
}));

const WorkShiftCreateRoute = require('@/app/(app)/work/create').default as typeof import('@/app/(app)/work/create').default;
const WorkShiftEditRoute = require('@/app/(app)/work/[id]/edit').default as typeof import('@/app/(app)/work/[id]/edit').default;

describe('Work navigation routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoad.mockResolvedValue(undefined);
    mockParams = {};
  });

  test('returns from the create route to Work', async () => {
    await render(<WorkShiftCreateRoute />);
    await fireEvent.press(screen.getByTestId('create-cancel'));

    expect(mockReplace).toHaveBeenCalledWith('/work');
  });

  test('loads a valid integer edit id once and returns to Work', async () => {
    mockParams = { id: '42' };
    await render(<ThemeProvider><WorkShiftEditRoute /></ThemeProvider>);

    expect(mockLoad).toHaveBeenCalledWith(42);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('edit-cancel'));
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/work');
  });

  test('does not load a malformed edit id and provides a safe recovery action', async () => {
    mockParams = { id: '4.2' };
    await render(<ThemeProvider><WorkShiftEditRoute /></ThemeProvider>);

    expect(mockLoad).not.toHaveBeenCalled();
    expect(screen.getByText('work.edit.notFound')).toBeTruthy();
    await fireEvent.press(screen.getByText('navigation.backToWork'));
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/work');
  });
});
