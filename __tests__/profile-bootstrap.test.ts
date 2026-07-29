import { describe, expect, jest, test } from '@jest/globals';

jest.mock('@/lib/supabase/client', () => ({ supabase: {} }));

import { ProfileApiError } from '@/features/profile/profileApi';
import { bootstrapProfile, getValidMetadataNickname, PROFILE_METADATA_NICKNAME_KEY } from '@/features/profile/profileBootstrap';
import type { Profile } from '@/features/profile/profileTypes';

const userId = 'user-1';
const completeProfile: Profile = { id: userId, nickname: 'Courier_1' };

function dependencies(profile: Profile | null) {
  return {
    getOwnProfile: jest.fn<typeof import('@/features/profile/profileApi').getOwnProfile>().mockResolvedValue(profile),
    upsertOwnProfile: jest.fn<typeof import('@/features/profile/profileApi').upsertOwnProfile>().mockResolvedValue(),
  };
}

describe('profile bootstrap', () => {
  test('returns ready for an existing profile with a valid nickname', async () => {
    const api = dependencies(completeProfile);

    await expect(bootstrapProfile(userId, {}, api)).resolves.toEqual({ status: 'ready', profile: completeProfile });
    expect(api.upsertOwnProfile).not.toHaveBeenCalled();
  });

  test('returns needs_nickname for missing or null profiles without valid metadata', async () => {
    const missing = dependencies(null);
    const nullNickname = dependencies({ id: userId, nickname: null });

    await expect(bootstrapProfile(userId, {}, missing)).resolves.toEqual({
      status: 'needs_nickname', profile: null, reason: 'missing_profile',
    });
    await expect(bootstrapProfile(userId, {}, nullNickname)).resolves.toEqual({
      status: 'needs_nickname', profile: { id: userId, nickname: null }, reason: 'missing_nickname',
    });
    expect(missing.upsertOwnProfile).not.toHaveBeenCalled();
    expect(nullNickname.upsertOwnProfile).not.toHaveBeenCalled();
  });

  test('repairs missing and null-nickname profiles only with the confirmed metadata key', async () => {
    const missing = dependencies(null);
    missing.getOwnProfile.mockResolvedValueOnce(null).mockResolvedValueOnce(completeProfile);
    const nullNickname = dependencies({ id: userId, nickname: null });
    nullNickname.getOwnProfile.mockResolvedValueOnce({ id: userId, nickname: null }).mockResolvedValueOnce(completeProfile);

    await expect(bootstrapProfile(userId, { nickname: ' Courier_1 ' }, missing)).resolves.toEqual({ status: 'ready', profile: completeProfile });
    await expect(bootstrapProfile(userId, { nickname: 'Courier_1' }, nullNickname)).resolves.toEqual({ status: 'ready', profile: completeProfile });

    expect(missing.upsertOwnProfile).toHaveBeenCalledWith(userId, 'Courier_1');
    expect(nullNickname.upsertOwnProfile).toHaveBeenCalledWith(userId, 'Courier_1');
    expect(missing.getOwnProfile).toHaveBeenCalledTimes(2);
    expect(nullNickname.getOwnProfile).toHaveBeenCalledTimes(2);
  });

  test('rejects guessed aliases, non-string and invalid metadata without writing', async () => {
    const api = dependencies(null);

    await expect(bootstrapProfile(userId, { username: 'Courier_1' }, api)).resolves.toMatchObject({ status: 'needs_nickname' });
    await expect(bootstrapProfile(userId, { nickname: 123 }, api)).resolves.toMatchObject({ status: 'needs_nickname' });
    await expect(bootstrapProfile(userId, { nickname: 'not valid!' }, api)).resolves.toMatchObject({ status: 'needs_nickname' });

    expect(api.upsertOwnProfile).not.toHaveBeenCalled();
  });

  test('maps conflict, network, and forbidden errors to safe semantic states', async () => {
    const conflict = dependencies(null);
    const network = dependencies(null);
    const forbidden = dependencies(null);
    conflict.upsertOwnProfile.mockRejectedValue(new ProfileApiError('nickname_conflict'));
    network.getOwnProfile.mockRejectedValue(new ProfileApiError('network_unavailable'));
    forbidden.getOwnProfile.mockRejectedValue(new ProfileApiError('forbidden'));

    await expect(bootstrapProfile(userId, { nickname: 'Courier_1' }, conflict)).resolves.toEqual({
      status: 'needs_nickname', profile: null, reason: 'nickname_conflict',
    });
    await expect(bootstrapProfile(userId, {}, network)).resolves.toEqual({
      status: 'recoverable_error', profile: null, error: 'network_unavailable',
    });
    await expect(bootstrapProfile(userId, {}, forbidden)).resolves.toEqual({
      status: 'blocked', profile: null, error: 'forbidden',
    });
  });

  test('uses only the confirmed nickname metadata contract and validation rule', () => {
    expect(PROFILE_METADATA_NICKNAME_KEY).toBe('nickname');
    expect(getValidMetadataNickname({ nickname: '  Courier_1  ' })).toBe('Courier_1');
    expect(getValidMetadataNickname({ nickname: 'ab' })).toBeNull();
    expect(getValidMetadataNickname({ nickname: 'a'.repeat(16) })).toBeNull();
    expect(getValidMetadataNickname({ nickname: 'Nämé' })).toBeNull();
  });
});
