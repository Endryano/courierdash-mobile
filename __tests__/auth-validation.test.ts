import { describe, expect, test } from '@jest/globals';

import { validateLoginInput, validateSignupInput } from '@/features/auth/authValidation';
import type { AuthFieldErrors, SignInInput, SignUpInput } from '@/features/auth/authValidation';

const loginCases: Array<[SignInInput, keyof AuthFieldErrors, AuthFieldErrors[keyof AuthFieldErrors]]> = [
  [{ email: '', password: 'secret' }, 'email', 'auth.required'],
  [{ email: 'invalid-email', password: 'secret' }, 'email', 'auth.invalidEmail'],
  [{ email: 'courier@example.com', password: '' }, 'password', 'auth.required'],
];

const signupCases: Array<[SignUpInput, keyof AuthFieldErrors, AuthFieldErrors[keyof AuthFieldErrors]]> = [
  [{ email: '', password: 'secret', confirmPassword: 'secret' }, 'email', 'auth.required'],
  [{ email: 'courier@example.com', password: '', confirmPassword: 'secret' }, 'password', 'auth.required'],
  [{ email: 'courier@example.com', password: 'secret', confirmPassword: '' }, 'confirmPassword', 'auth.required'],
  [{ email: 'courier@example.com', password: 'secret', confirmPassword: 'different' }, 'confirmPassword', 'auth.passwordMismatch'],
];

describe('auth validation', () => {
  test('accepts valid login input and normalizes only email', () => {
    const result = validateLoginInput({ email: '  courier@example.com  ', password: ' secret ' });

    expect(result).toEqual({
      isValid: true,
      fieldErrors: {},
      value: { email: 'courier@example.com', password: ' secret ' },
    });
  });

  test.each(loginCases)('rejects invalid login input %#', (input, field, error) => {
    const result = validateLoginInput(input);

    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.fieldErrors[field]).toBe(error);
  });

  test('accepts valid signup input with the stable typed result shape', () => {
    const result = validateSignupInput({ email: ' courier@example.com ', password: ' secret ', confirmPassword: ' secret ' });

    expect(result).toEqual({
      isValid: true,
      fieldErrors: {},
      value: { email: 'courier@example.com', password: ' secret ', confirmPassword: ' secret ' },
    });
  });

  test.each(signupCases)('rejects invalid signup input %#', (input, field, error) => {
    const result = validateSignupInput(input);

    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.fieldErrors[field]).toBe(error);
  });
});
