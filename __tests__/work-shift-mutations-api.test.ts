import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { createEmptyWorkShiftInput } from '@/features/work/domain/workShiftCreate';
import { validateWorkShiftCreate } from '@/features/work/domain/workShiftValidation';

const mockInsert = jest.fn<(payload: unknown) => Promise<{ error: unknown }>>();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockFetch = jest.fn();
jest.mock('@/lib/supabase/client', () => ({ supabase: { from: mockFrom } }));

const { WorkShiftMutationError, createOwnWorkShift, toWorkShiftInsertPayload } = require('@/features/work/api/workShiftMutationsApi') as typeof import('@/features/work/api/workShiftMutationsApi');

function validInput() {
  const input = createEmptyWorkShiftInput(); input.date = '2026-07-29'; input.platforms.uber.enabled = true;
  const validation = validateWorkShiftCreate(input); if (!validation.isValid) throw new Error('test input must be valid'); return validation.value;
}

describe('work shift mutations API', () => {
  beforeEach(() => { jest.clearAllMocks(); global.fetch = mockFetch as unknown as typeof fetch; mockInsert.mockResolvedValue({ error: null }); });

  test('inserts one explicit owner payload without generated or legacy columns', async () => {
    const input = validInput();
    input.platforms.uber = { enabled: true, income: 1, orders: 2, appTips: 3, cashTips: 4, bonuses: 5 };
    input.platforms.wolt = { enabled: true, income: 6, orders: 7, appTips: 8, cashTips: 9, bonuses: 10 };
    input.platforms.bolt = { enabled: true, income: 11, orders: 12, appTips: 13, cashTips: 14, bonuses: 15 };
    input.platforms.glovo = { enabled: true, income: 16, orders: 17, appTips: 18, cashTips: 19, bonuses: 20 };
    input.platforms.stuart = { enabled: true, income: 21, orders: 22, appTips: 23, cashTips: 24, bonuses: 25 };
    input.platforms.other = { enabled: true, name: 'Other', income: 26, orders: 27, appTips: 28, cashTips: 29, bonuses: 30 };
    await createOwnWorkShift('user-1', input);
    expect(mockFrom).toHaveBeenCalledWith('work_shifts');
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toEqual({
      user_id: 'user-1', date: '2026-07-29', km: 0, hours: 0,
      uber: 1, orders_uber: 2, tips_uber: 3, cash_tips_uber: 4, bonuses_uber: 5,
      wolt: 6, orders_wolt: 7, tips_wolt: 8, cash_tips_wolt: 9, bonuses_wolt: 10,
      bolt: 11, orders_bolt: 12, tips_bolt: 13, cash_tips_bolt: 14, bonuses_bolt: 15,
      glovo: 16, orders_glovo: 17, tips_glovo: 18, cash_tips_glovo: 19, bonuses_glovo: 20,
      stuart: 21, orders_stuart: 22, tips_stuart: 23, cash_tips_stuart: 24, bonuses_stuart: 25,
      other_income: 26, orders_other: 27, tips_other: 28, cash_tips_other: 29, bonuses_other: 30, other_platform_name: 'Other',
    });
    expect(payload).not.toHaveProperty('id'); expect(payload).not.toHaveProperty('created_at'); expect(payload).not.toHaveProperty('tips'); expect(payload).not.toHaveProperty('bonuses');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('maps the verified user/date unique constraint and blocked errors safely', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', constraint: 'work_shifts_user_date_key', message: 'constraint detail' } });
    await expect(createOwnWorkShift('user-1', validInput())).rejects.toMatchObject({ category: 'duplicate_date' });
    mockInsert.mockResolvedValue({ error: { code: '42501', message: 'permission denied' } });
    await expect(createOwnWorkShift('user-1', validInput())).rejects.toBeInstanceOf(WorkShiftMutationError);
    await expect(createOwnWorkShift('user-1', validInput())).rejects.toMatchObject({ category: 'blocked' });
  });

  test('does not treat an unrelated unique violation as a duplicate date', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', constraint: 'another_unique_key', message: 'constraint detail' } });
    await expect(createOwnWorkShift('user-1', validInput())).rejects.toMatchObject({ category: 'unknown' });
  });

  test('zeros disabled platform metrics in the payload', () => {
    const input = validInput(); input.platforms.wolt.income = 99;
    expect(toWorkShiftInsertPayload('user-1', input)).toMatchObject({ wolt: 0, orders_wolt: 0, tips_wolt: 0, cash_tips_wolt: 0, bonuses_wolt: 0 });
  });
});
