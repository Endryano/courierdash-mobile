import { describe, expect, jest, test } from '@jest/globals';

jest.mock('@/lib/supabase/client', () => ({ supabase: {} }));

import { ProfileApiError } from '@/features/profile/profileApi';
import { mapNicknameError } from '@/features/profile/nicknameError';
import type { SafeProfileError } from '@/features/profile/profileTypes';

const errorCases: Array<[SafeProfileError, string]> = [
  ['nickname_conflict', 'profile.nickname.error.conflict'],
  ['network_unavailable', 'profile.nickname.error.network'],
  ['forbidden', 'profile.nickname.error.forbidden'],
  ['unknown', 'profile.nickname.error.unknown'],
];

describe('nickname error mapping', () => {
  test.each(errorCases)('maps a safe category %#', (category, key) => {
    expect(mapNicknameError(new ProfileApiError(category))).toBe(key);
  });

  test('does not expose unknown raw errors', () => {
    const rawError = new Error('database password=secret access_token=token');
    const key = mapNicknameError(rawError);

    expect(key).toBe('profile.nickname.error.unknown');
    expect(key).not.toContain('secret');
    expect(key).not.toContain('token');
  });
});
