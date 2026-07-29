import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockSelect = jest.fn<any>();
const mockUserEq = jest.fn<any>(() => ({ select: mockSelect }));
const mockIdEq = jest.fn<any>(() => ({ eq: mockUserEq }));
const mockDelete = jest.fn<any>(() => ({ eq: mockIdEq }));
const mockFrom = jest.fn<any>(() => ({ delete: mockDelete }));

jest.mock('@/lib/supabase/client', () => ({ supabase: { from: mockFrom } }));

const { deleteOwnWorkShift, WorkShiftDeleteError } = require('@/features/work/api/workShiftMutationsApi') as typeof import('@/features/work/api/workShiftMutationsApi');

describe('work shift delete API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockResolvedValue({ data: [{ id: 1 }], error: null });
  });

  test('uses the exact minimal owner-scoped delete chain', async () => {
    await deleteOwnWorkShift('user-a', 1);

    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('work_shifts');
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockIdEq).toHaveBeenCalledWith('id', 1);
    expect(mockUserEq).toHaveBeenCalledWith('user_id', 'user-a');
    expect(mockSelect).toHaveBeenCalledWith('id');
  });

  test.each([
    { data: undefined, error: null },
    { data: null, error: null },
    { data: [], error: null },
    { data: [{}], error: null },
    { data: [{ id: 2 }], error: null },
    { data: [{ id: 1 }, { id: 1 }], error: null },
  ])('rejects an unverified affected-row response', async (result) => {
    mockSelect.mockResolvedValueOnce(result);
    await expect(deleteOwnWorkShift('user-a', 1)).rejects.toBeInstanceOf(WorkShiftDeleteError);
  });

  test('maps backend and thrown failures to a safe typed error', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } });
    await expect(deleteOwnWorkShift('user-a', 1)).rejects.toMatchObject({ category: 'blocked', message: 'Work shift delete failed.' });

    mockSelect.mockRejectedValueOnce(new Error('connection reset'));
    await expect(deleteOwnWorkShift('user-a', 1)).rejects.toMatchObject({ category: 'recoverable', message: 'Work shift delete failed.' });
  });

  test('rejects invalid identifiers before making a request', async () => {
    await expect(deleteOwnWorkShift('', 1)).rejects.toMatchObject({ category: 'affected_row_failure' });
    await expect(deleteOwnWorkShift('user-a', 0)).rejects.toMatchObject({ category: 'affected_row_failure' });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
