import { beforeEach, describe, expect, jest, test } from '@jest/globals';

type ReadResponse = { data: unknown; error: unknown };
type WriteResponse = { error: unknown };

const mockMaybeSingle = jest.fn<() => Promise<ReadResponse>>();
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockUpsert = jest.fn<() => Promise<WriteResponse>>();
const mockFrom = jest.fn(() => ({ select: mockSelect, upsert: mockUpsert }));
const mockFetch = jest.fn();

jest.mock('@/lib/supabase/client', () => ({ supabase: { from: mockFrom } }));

const { getOwnProfile, upsertOwnProfile } = require('@/features/profile/profileApi') as typeof import('@/features/profile/profileApi');

describe('profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockResolvedValue({ error: null });
  });

  test('reads only id and nickname for the exact owner and represents a missing row', async () => {
    await expect(getOwnProfile('user-1')).resolves.toBeNull();

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockSelect).toHaveBeenCalledWith('id, nickname');
    expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('rejects malformed or foreign profile results safely', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'other-user', nickname: 'Courier_1' }, error: null });

    await expect(getOwnProfile('user-1')).rejects.toMatchObject({ category: 'invalid_response' });
  });

  test('upserts only the authenticated owner id and valid nickname', async () => {
    await upsertOwnProfile('user-1', 'Courier_1' as never);

    expect(mockUpsert).toHaveBeenCalledWith({ id: 'user-1', nickname: 'Courier_1' }, { onConflict: 'id' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('does not send invalid or null nicknames', async () => {
    await expect(upsertOwnProfile('user-1', '' as never)).rejects.toMatchObject({ category: 'invalid_response' });
    await expect(upsertOwnProfile('user-1', null as never)).rejects.toMatchObject({ category: 'invalid_response' });
    await expect(upsertOwnProfile('user-1', 'invalid nickname!' as never)).rejects.toMatchObject({ category: 'invalid_response' });

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
