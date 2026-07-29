import { beforeEach, describe, expect, jest, test } from '@jest/globals';

type ReadResponse = { data: unknown; error: unknown };

const mockOrder = jest.fn<() => Promise<ReadResponse>>();
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockFetch = jest.fn();

jest.mock('@/lib/supabase/client', () => ({ supabase: { from: mockFrom } }));

const { WorkShiftsApiError, getOwnWorkShifts, mapWorkShift, workShiftsSelect } = require('@/features/work/api/workShiftsApi') as typeof import('@/features/work/api/workShiftsApi');

function validRow() {
  return {
    id: 7, date: '2026-07-29', hours: 8.5, km: 42,
    uber: 1, orders_uber: null, tips_uber: 3, cash_tips_uber: 4, bonuses_uber: 5,
    wolt: 6, orders_wolt: 7, tips_wolt: null, cash_tips_wolt: 9, bonuses_wolt: 10,
    bolt: 11, orders_bolt: 12, tips_bolt: 13, cash_tips_bolt: 14, bonuses_bolt: null,
    glovo: 16, orders_glovo: null, tips_glovo: null, cash_tips_glovo: 19, bonuses_glovo: null,
    stuart: 21, orders_stuart: 22, tips_stuart: 23, cash_tips_stuart: 24, bonuses_stuart: 25,
    other_income: 26, orders_other: 27, tips_other: 28, cash_tips_other: 29, bonuses_other: 30, other_platform_name: 'Other',
  };
}

describe('work shifts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  test('uses the exact owner-scoped analytics read projection and date order', async () => {
    await expect(getOwnWorkShifts('user-1')).resolves.toEqual([]);

    expect(mockFrom).toHaveBeenCalledWith('work_shifts');
    expect(mockSelect).toHaveBeenCalledWith(workShiftsSelect);
    expect(workShiftsSelect.split(', ')).toEqual([
      'id', 'date', 'hours', 'km',
      'uber', 'orders_uber', 'tips_uber', 'cash_tips_uber', 'bonuses_uber',
      'wolt', 'orders_wolt', 'tips_wolt', 'cash_tips_wolt', 'bonuses_wolt',
      'bolt', 'orders_bolt', 'tips_bolt', 'cash_tips_bolt', 'bonuses_bolt',
      'glovo', 'orders_glovo', 'tips_glovo', 'cash_tips_glovo', 'bonuses_glovo',
      'stuart', 'orders_stuart', 'tips_stuart', 'cash_tips_stuart', 'bonuses_stuart',
      'other_income', 'orders_other', 'tips_other', 'cash_tips_other', 'bonuses_other', 'other_platform_name',
    ]);
    expect(workShiftsSelect.split(', ')).not.toContain('user_id');
    expect(workShiftsSelect.split(', ')).not.toContain('created_at');
    expect(workShiftsSelect.split(', ')).not.toContain('tips');
    expect(workShiftsSelect.split(', ')).not.toContain('bonuses');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('maps all analytics fields explicitly without leaking database names', () => {
    const row = validRow();
    expect(mapWorkShift(row)).toEqual({
      id: 7, date: '2026-07-29', hours: 8.5, km: 42,
      analytics: { platforms: {
        uber: { income: 1, orders: null, appTips: 3, cashTips: 4, bonuses: 5 },
        wolt: { income: 6, orders: 7, appTips: null, cashTips: 9, bonuses: 10 },
        bolt: { income: 11, orders: 12, appTips: 13, cashTips: 14, bonuses: null },
        glovo: { income: 16, orders: null, appTips: null, cashTips: 19, bonuses: null },
        stuart: { income: 21, orders: 22, appTips: 23, cashTips: 24, bonuses: 25 },
        other: { income: 26, orders: 27, appTips: 28, cashTips: 29, bonuses: 30, name: 'Other' },
      } },
    });
  });

  test('preserves nullable current metrics and accepts a null Other name', async () => {
    const row = { ...validRow(), orders_uber: null, tips_wolt: null, bonuses_bolt: null, orders_glovo: null, tips_glovo: null, bonuses_glovo: null, other_platform_name: null };
    mockOrder.mockResolvedValue({ data: [row], error: null });

    await expect(getOwnWorkShifts('user-1')).resolves.toMatchObject([{
      analytics: { platforms: {
        uber: { orders: null }, wolt: { appTips: null }, bolt: { bonuses: null }, glovo: { orders: null, appTips: null, bonuses: null }, other: { name: null },
      } },
    }]);
  });

  test('preserves numeric zero without converting it to null', async () => {
    const row = { ...validRow(), orders_uber: 0, tips_wolt: 0, bonuses_bolt: 0 };
    mockOrder.mockResolvedValue({ data: [row], error: null });

    await expect(getOwnWorkShifts('user-1')).resolves.toMatchObject([{
      analytics: { platforms: {
        uber: { orders: 0 }, wolt: { appTips: 0 }, bolt: { bonuses: 0 },
      } },
    }]);
  });

  test.each([
    ['missing analytics column', (row: ReturnType<typeof validRow>) => { delete (row as Partial<typeof row>).uber; }],
    ['undefined nullable field', (row: ReturnType<typeof validRow>) => { (row as { orders_uber?: unknown }).orders_uber = undefined; }],
    ['numeric string', (row: ReturnType<typeof validRow>) => { (row as { uber: unknown }).uber = '1'; }],
    ['NaN', (row: ReturnType<typeof validRow>) => { row.tips_stuart = Number.NaN; }],
    ['Infinity', (row: ReturnType<typeof validRow>) => { row.cash_tips_other = Number.POSITIVE_INFINITY; }],
    ['negative metric', (row: ReturnType<typeof validRow>) => { row.bonuses_wolt = -1; }],
    ['fractional orders', (row: ReturnType<typeof validRow>) => { row.orders_other = 1.5; }],
    ['null Stuart numeric metric', (row: ReturnType<typeof validRow>) => { (row as { orders_stuart: unknown }).orders_stuart = null; }],
    ['null Other numeric metric', (row: ReturnType<typeof validRow>) => { (row as { tips_other: unknown }).tips_other = null; }],
    ['malformed Other name', (row: ReturnType<typeof validRow>) => { (row as { other_platform_name: unknown }).other_platform_name = 9; }],
    ['malformed base field', (row: ReturnType<typeof validRow>) => { row.date = '2026-02-30'; }],
  ])('rejects a %s selected row safely', async (_name, mutate) => {
    const row = validRow();
    mutate(row);
    mockOrder.mockResolvedValue({ data: [row], error: null });
    await expect(getOwnWorkShifts('user-1')).rejects.toMatchObject({ category: 'invalid_response' });
  });

  test('maps forbidden errors safely', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } });
    await expect(getOwnWorkShifts('user-1')).rejects.toBeInstanceOf(WorkShiftsApiError);
    await expect(getOwnWorkShifts('user-1')).rejects.toMatchObject({ category: 'forbidden' });
  });
});
