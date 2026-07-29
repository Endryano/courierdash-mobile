import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

const mockRetry = jest.fn<() => Promise<void>>();
let mockWorkState: { status: 'idle' | 'loading' | 'empty' | 'ready' | 'recoverable_error' | 'blocked'; shifts: readonly { id: number; date: string; hours: number; km: number }[]; retry: () => Promise<void> };

jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => mockWorkState }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ t: (key: string) => key }) }));
jest.mock('@/features/work/components/WorkShiftCreateForm', () => {
  const React = require('react');
  const { Text: MockText } = require('react-native');
  return { WorkShiftCreateForm: () => React.createElement(MockText, { testID: 'work-create-form' }, 'create form') };
});

const { WorkShiftsPlaceholder } = require('@/features/work/components/WorkShiftsPlaceholder') as typeof import('@/features/work/components/WorkShiftsPlaceholder');

function renderPlaceholder() {
  return render(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
}

describe('WorkShiftsPlaceholder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetry.mockResolvedValue(undefined);
    mockWorkState = { status: 'loading', shifts: [], retry: mockRetry };
  });

  test('renders loading, empty, and ready states without calculations', async () => {
    const view = await renderPlaceholder();
    expect(screen.getByText('work.loading')).toBeTruthy();

    mockWorkState = { status: 'empty', shifts: [], retry: mockRetry };
    await view.rerender(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
    expect(screen.getByText('work.empty.title')).toBeTruthy();

    mockWorkState = { status: 'ready', shifts: [{ id: 1, date: '2026-07-29', hours: 8, km: 20 }], retry: mockRetry };
    await view.rerender(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
    expect(screen.getByText('2026-07-29')).toBeTruthy();
    expect(screen.getByText('work.shift.hours: 8')).toBeTruthy();
  });

  test('renders safe errors and delegates retry without raw backend content', async () => {
    let resolveRetry: (() => void) | undefined;
    mockRetry.mockReturnValue(new Promise((resolve) => { resolveRetry = resolve; }));
    mockWorkState = { status: 'recoverable_error', shifts: [], retry: mockRetry };
    const view = await renderPlaceholder();
    expect(screen.getByText('work.error.title')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('work-retry'));
    await fireEvent.press(screen.getByTestId('work-retry'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('work-retry').props.accessibilityState).toEqual({ disabled: true });
    expect(screen.queryByText('permission denied')).toBeNull();

    resolveRetry?.();

    mockWorkState = { status: 'blocked', shifts: [], retry: mockRetry };
    await view.rerender(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
    expect(screen.getByText('work.blocked.title')).toBeTruthy();
  });

  test('opens the create form from empty and ready states', async () => {
    mockWorkState = { status: 'empty', shifts: [], retry: mockRetry };
    const view = await renderPlaceholder();
    await fireEvent.press(screen.getByTestId('work-create-action'));
    expect(screen.getByTestId('work-create-form')).toBeTruthy();

    await view.unmount();
    mockWorkState = { status: 'ready', shifts: [{ id: 1, date: '2026-07-29', hours: 8, km: 20 }], retry: mockRetry };
    await renderPlaceholder();
    await fireEvent.press(screen.getByTestId('work-create-action'));
    expect(screen.getByTestId('work-create-form')).toBeTruthy();
  });
});
