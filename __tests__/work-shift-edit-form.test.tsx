import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';

import type { WorkShiftEditContextValue } from '@/features/work/provider/workShiftEditContext';
import { ThemeProvider } from '@/theme/ThemeProvider';

const mockSubmit = jest.fn<WorkShiftEditContextValue['submit']>();
let mockEditState: WorkShiftEditContextValue;

jest.mock('@/features/work/hooks/useWorkShiftEdit', () => ({ useWorkShiftEdit: () => mockEditState }));
jest.mock('@/i18n/LocalizationProvider', () => ({ useLocalization: () => ({ locale: 'en', t: (key: string) => key }) }));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: ({ onChange, testID }: { onChange: (event: { type: 'set' }, value: Date) => void; testID: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `${testID}-set`, onPress: () => onChange({ type: 'set' }, new Date(2024, 1, 29, 12)) }, 'set');
  },
}));

const { WorkShiftEditForm } = require('@/features/work/components/WorkShiftEditForm') as typeof import('@/features/work/components/WorkShiftEditForm');

function readyState(): WorkShiftEditContextValue {
  const input = { date: '2026-07-29', km: 0, hours: 0, platforms: { uber: { enabled: true, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, wolt: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, bolt: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, glovo: { enabled: false, income: 0, orders: null, appTips: null, cashTips: 0, bonuses: null }, stuart: { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 }, other: { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0, name: null } } };
  return { status: 'ready', shift: { id: 1, ...input }, input, submit: mockSubmit, load: jest.fn(), reconcile: jest.fn(), reset: jest.fn(), subjectUserId: 'user-a' } as WorkShiftEditContextValue;
}

describe('WorkShiftEditForm', () => {
  beforeEach(() => { jest.clearAllMocks(); mockSubmit.mockResolvedValue(undefined); mockEditState = readyState(); });

  test('initializes from the canonical edit date and submits the selected canonical date', async () => {
    const view = await render(<ThemeProvider><WorkShiftEditForm onCancel={jest.fn()} /></ThemeProvider>);
    expect(view.getByTestId('work-edit-date').props.accessibilityLabel).toContain('2026');
    expect(view.getByTestId('work-edit-date').props.onChangeText).toBeUndefined();
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-date')); });
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-date-picker-set')); });
    const confirm = view.queryByTestId('work-edit-date-confirm');
    if (confirm !== null) await act(async () => { fireEvent.press(confirm); });
    await act(async () => { fireEvent.press(view.getByTestId('work-edit-submit')); });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: '2024-02-29' }));
  });
});
