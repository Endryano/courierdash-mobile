import { describe, expect, test } from '@jest/globals';

import { validateSupabaseEnvironment } from '@/config/environment';

const validEnvironment = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key',
};

describe('validateSupabaseEnvironment', () => {
  test('accepts a valid URL and a non-empty public key', () => {
    expect(validateSupabaseEnvironment(validEnvironment)).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'test-public-key',
    });
  });

  test('rejects a missing URL with a sanitized error', () => {
    expect(() => validateSupabaseEnvironment({ ...validEnvironment, EXPO_PUBLIC_SUPABASE_URL: undefined })).toThrow(
      'EXPO_PUBLIC_SUPABASE_URL is required',
    );
  });

  test('rejects a missing key with a sanitized error', () => {
    expect(() => validateSupabaseEnvironment({ ...validEnvironment, EXPO_PUBLIC_SUPABASE_ANON_KEY: undefined })).toThrow(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is required',
    );
  });

  test('rejects a malformed URL with a sanitized error', () => {
    expect(() =>
      validateSupabaseEnvironment({ ...validEnvironment, EXPO_PUBLIC_SUPABASE_URL: 'not a URL' }),
    ).toThrow('EXPO_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL');
  });

  test('rejects whitespace-only values', () => {
    expect(() => validateSupabaseEnvironment({ ...validEnvironment, EXPO_PUBLIC_SUPABASE_URL: '   ' })).toThrow(
      'EXPO_PUBLIC_SUPABASE_URL is required',
    );
    expect(() => validateSupabaseEnvironment({ ...validEnvironment, EXPO_PUBLIC_SUPABASE_ANON_KEY: '   ' })).toThrow(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is required',
    );
  });

  test('does not expose a supplied key in configuration errors', () => {
    const secretLikeValue = 'test-public-key-that-must-not-appear-in-errors';

    try {
      validateSupabaseEnvironment({
        EXPO_PUBLIC_SUPABASE_URL: 'not a URL',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: secretLikeValue,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(secretLikeValue);
    }
  });
});
