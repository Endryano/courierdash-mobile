import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { ValidNickname } from '@/features/profile/profileTypes';

const mockUpsertOwnProfile = jest.fn<(userId: string, nickname: ValidNickname) => Promise<void>>();

jest.mock('@/features/profile/profileApi', () => ({ upsertOwnProfile: mockUpsertOwnProfile }));

const { saveOwnNickname } = require('@/features/profile/nicknameApi') as typeof import('@/features/profile/nicknameApi');

describe('nickname API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsertOwnProfile.mockResolvedValue(undefined);
  });

  test('delegates only the authenticated owner id and nickname to the narrow profile operation', async () => {
    await saveOwnNickname('user-1', 'Courier_1' as never);

    expect(mockUpsertOwnProfile).toHaveBeenCalledWith('user-1', 'Courier_1');
  });
});
