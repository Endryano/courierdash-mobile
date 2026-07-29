import { beforeEach, describe, expect, jest, test } from '@jest/globals';

type ReadResponse = { data: unknown; error: unknown };

const mockOrder = jest.fn<() => Promise<ReadResponse>>();
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockFetch = jest.fn();

jest.mock('@/lib/supabase/client', () => ({ supabase: { from: mockFrom } }));

const { WorkShiftsApiError, getOwnWorkShifts, mapWorkShift } = require('@/features/work/api/workShiftsApi') as typeof import('@/features/work/api/workShiftsApi');

describe('work shifts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  test('reads only the owner rows using the verified descending date order', async () => {
    await expect(getOwnWorkShifts('user-1')).resolves.toEqual([]);

    expect(mockFrom).toHaveBeenCalledWith('work_shifts');
    expect(mockSelect).toHaveBeenCalledWith('id, date, hours, km');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('maps the verified selected row shape into the domain model', () => {
    expect(mapWorkShift({ id: 7, date: '2026-07-29', hours: 8.5, km: 42 })).toEqual({ id: 7, date: '2026-07-29', hours: 8.5, km: 42 });
  });

  test.each([
    { id: '7', date: '2026-07-29', hours: 8.5, km: 42 },
    { id: 7, date: '2026-02-30', hours: 8.5, km: 42 },
    { id: 7, date: '2026-07-29', hours: null, km: 42 },
    { id: 7, date: '2026-07-29', hours: Number.NaN, km: 42 },
    { id: 7, date: '2026-07-29', hours: 8.5, km: Number.POSITIVE_INFINITY },
  ])('rejects malformed selected rows safely', async (row) => {
    mockOrder.mockResolvedValue({ data: [row], error: null });
    await expect(getOwnWorkShifts('user-1')).rejects.toMatchObject({ category: 'invalid_response' });
  });

  test('maps forbidden errors safely', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } });
    await expect(getOwnWorkShifts('user-1')).rejects.toBeInstanceOf(WorkShiftsApiError);
    await expect(getOwnWorkShifts('user-1')).rejects.toMatchObject({ category: 'forbidden' });
  });
});
