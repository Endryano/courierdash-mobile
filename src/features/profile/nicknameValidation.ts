import type { ValidNickname } from './profileTypes';

export type NicknameValidationError = 'required' | 'too_short' | 'too_long' | 'invalid_characters';

export type NicknameValidationResult =
  | { isValid: true; value: ValidNickname }
  | { isValid: false; error: NicknameValidationError };

const nicknamePattern = /^[A-Za-z0-9_]+$/;

export function validateNickname(value: unknown): NicknameValidationResult {
  if (typeof value !== 'string') return { isValid: false, error: 'required' };

  const nickname = value.trim();
  if (!nickname) return { isValid: false, error: 'required' };
  if (nickname.length < 3) return { isValid: false, error: 'too_short' };
  if (nickname.length > 15) return { isValid: false, error: 'too_long' };
  if (!nicknamePattern.test(nickname)) return { isValid: false, error: 'invalid_characters' };

  return { isValid: true, value: nickname as ValidNickname };
}
