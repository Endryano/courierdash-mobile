import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';
import type { WorkShift } from '@/features/work/domain/workShift';

const mockRetry = jest.fn<() => Promise<void>>();
const mockRequestDelete = jest.fn();
const mockPush = jest.fn();
let mockWorkState: { status: 'idle' | 'loading' | 'empty' | 'ready' | 'recoverable_error' | 'blocked'; shifts: readonly WorkShift[]; retry: () => Promise<void> };

jest.mock('@/features/work/hooks/useWorkShifts', () => ({ useWorkShifts: () => mockWorkState }));
jest.mock('@/features/work/hooks/useWorkShiftDelete', () => ({ useWorkShiftDelete: () => ({ status: 'idle', requestDelete: mockRequestDelete }) }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('expo-router', () => ({ router: { push: mockPush } }));

const { WorkShiftsPlaceholder } = require('@/features/work/components/WorkShiftsPlaceholder') as typeof import('@/features/work/components/WorkShiftsPlaceholder');

function renderPlaceholder() {
  return render(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
}

function createShift(id: number, date: string, hours: number, km: number): WorkShift {
  return {
    id,
    date,
    hours,
    km,
    analytics: {
      platforms: {
        uber: { income: 100, orders: 5, appTips: null, cashTips: 0, bonuses: null },
        wolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null },
        bolt: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null },
        glovo: { income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null },
        stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 },
        other: { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null },
      },
    },
  };
}

describe('WorkShiftsPlaceholder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestDelete.mockClear();
    mockRetry.mockResolvedValue(undefined);
    mockWorkState = { status: 'loading', shifts: [], retry: mockRetry };
  });

  test('renders loading, empty, and a scrollable ready history with canonical shift details', async () => {
    const view = await renderPlaceholder();
    expect(screen.getByText('work.loading')).toBeTruthy();
    expect(screen.getByTestId('app-state-loading')).toBeTruthy();

    mockWorkState = { status: 'empty', shifts: [], retry: mockRetry };
    await view.rerender(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
    expect(screen.getByText('work.empty.title')).toBeTruthy();

    mockWorkState = {
      status: 'ready',
      shifts: [
        createShift(2, '2026-07-30', 8.5, 20.25),
        createShift(1, '2026-07-29', 0, 0),
      ],
      retry: mockRetry,
    };
    await view.rerender(<ThemeProvider><WorkShiftsPlaceholder /></ThemeProvider>);
    expect(screen.getByTestId('work-shifts-list')).toBeTruthy();
    expect(screen.getByText('work.history.title').props.accessibilityRole).toBe('header');
    expect(screen.getByTestId('work-shift-2')).toBeTruthy();
    expect(screen.getByTestId('work-shift-1')).toBeTruthy();
    expect(screen.getAllByTestId(/work-shift-\d+/).map((item) => item.props.testID)).toEqual(['work-shift-2', 'work-shift-1']);
    expect(screen.getByText('July 30, 2026')).toBeTruthy();
    expect(screen.getByLabelText('work.create.date: July 30, 2026')).toBeTruthy();
    expect(screen.queryByText('2026-07-30')).toBeNull();
    expect(screen.getByText('work.history.title').props.accessibilityRole).toBe('header');
    expect(screen.getAllByText('work.history.hours')).toHaveLength(2);
    expect(screen.getAllByText('work.history.kilometers')).toHaveLength(2);
    expect(screen.getByText('8.5')).toBeTruthy();
    expect(screen.getByText('20.25')).toBeTruthy();
    expect(screen.getAllByText('PLN 100.00')).toHaveLength(4);
    expect(screen.getByTestId('work-shift-2').props.onPress).toBeUndefined();
    expect(screen.getAllByText('work.history.incomePerHour')).toHaveLength(2);
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

  test('navigates to the create route from empty and ready states', async () => {
    mockWorkState = { status: 'empty', shifts: [], retry: mockRetry };
    const view = await renderPlaceholder();
    await fireEvent.press(screen.getByTestId('work-create-action'));
    expect(mockPush).toHaveBeenCalledWith('/work/create');

    await view.unmount();
    mockWorkState = { status: 'ready', shifts: [createShift(1, '2026-07-29', 8, 20)], retry: mockRetry };
    await renderPlaceholder();
    await fireEvent.press(screen.getByTestId('work-create-action'));
    expect(mockPush).toHaveBeenLastCalledWith('/work/create');
  });

  test('renders Delete beside Edit and delegates only the safe canonical summary', async () => {
    const shift = createShift(1, '2026-07-29', 8, 20);
    mockWorkState = { status: 'ready', shifts: [shift], retry: mockRetry };
    await renderPlaceholder();

    expect(screen.getByTestId('work-edit-1')).toBeTruthy();
    expect(screen.getByTestId('work-edit-1').props.accessibilityLabel).toBe('work.edit.action');
    expect(screen.getByTestId('work-delete-1').props.accessibilityLabel).toBe('work.delete.action');
    await fireEvent.press(screen.getByTestId('work-edit-1'));
    expect(mockPush).toHaveBeenCalledWith('/work/1/edit');
    await fireEvent.press(screen.getByTestId('work-delete-1'));
    expect(mockRequestDelete).toHaveBeenCalledWith(shift);
    expect(mockRetry).not.toHaveBeenCalled();
  });
});
