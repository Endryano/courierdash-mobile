import { describe, expect, test } from '@jest/globals';

import { mapAuthError } from '@/features/auth/authError';
import type { AuthErrorKey } from '@/features/auth/authError';

const errorCases: Array<[unknown, AuthErrorKey]> = [
  [{ code: 'invalid_credentials' }, 'auth.error.invalidCredentials'],
  [{ message: 'User already registered' }, 'auth.error.accountExists'],
  [{ message: 'Email address is invalid' }, 'auth.invalidEmail'],
  [{ message: 'Password is too weak' }, 'auth.error.weakPassword'],
  [{ status: 429 }, 'auth.error.rateLimit'],
  [{ message: 'Network request failed' }, 'auth.error.network'],
  [{ message: 'An unrecognized backend failure occurred' }, 'auth.error.generic'],
];

describe('mapAuthError', () => {
  test.each(errorCases)('maps supported error category %#', (error, expected) => {
    expect(mapAuthError(error)).toBe(expected);
  });

  test('does not expose raw backend data in its semantic result', () => {
    const rawError = {
      message: 'unexpected failure password=secret access_token=token refresh_token=refresh session=payload stack=trace',
    };
    const result = mapAuthError(rawError);

    expect(result).toBe('auth.error.weakPassword');
    expect(result).not.toContain('secret');
    expect(result).not.toContain('token');
    expect(result).not.toContain('session');
    expect(result).not.toContain('trace');
  });
});
