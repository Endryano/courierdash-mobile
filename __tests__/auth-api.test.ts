import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { Session } from '@supabase/supabase-js';

type AuthResponse = { data: { session: Session | null }; error: unknown };

const mockSignInWithPassword = jest.fn<(input: { email: string; password: string }) => Promise<AuthResponse>>();
const mockSignUp = jest.fn<(input: { email: string; password: string }) => Promise<AuthResponse>>();
const mockSignOut = jest.fn<() => Promise<{ error: unknown }>>();
const mockFetch = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

const { AuthApiError, signInWithEmail, signOut, signUpWithEmail } = require('@/features/auth/authApi') as typeof import('@/features/auth/authApi');

describe('auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockSignInWithPassword.mockResolvedValue({ data: { session: null }, error: null });
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  test('signs in with a trimmed email and an unchanged password', async () => {
    await expect(signInWithEmail({ email: ' courier@example.com ', password: ' secret ' })).resolves.toBeNull();

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'courier@example.com', password: ' secret ' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('signs up with only a trimmed email and unchanged password', async () => {
    await expect(signUpWithEmail({ email: ' courier@example.com ', password: ' secret ' })).resolves.toBeNull();

    expect(mockSignUp).toHaveBeenCalledWith({ email: 'courier@example.com', password: ' secret ' });
    expect(mockSignUp.mock.calls[0][0]).not.toHaveProperty('confirmPassword');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('throws a typed, safe error key when Supabase returns an error', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { session: null }, error: { code: 'invalid_credentials' } });

    await expect(signInWithEmail({ email: 'courier@example.com', password: 'secret' })).rejects.toMatchObject({
      key: 'auth.error.invalidCredentials',
    } satisfies Partial<InstanceType<typeof AuthApiError>>);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('signs out through Supabase Auth and maps failures safely', async () => {
    await expect(signOut()).resolves.toBeUndefined();
    expect(mockSignOut).toHaveBeenCalledTimes(1);

    mockSignOut.mockResolvedValue({ error: { message: 'network request failed access_token=secret' } });
    await expect(signOut()).rejects.toMatchObject({ key: 'auth.error.network' } satisfies Partial<InstanceType<typeof AuthApiError>>);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
