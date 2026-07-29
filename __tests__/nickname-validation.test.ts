import { describe, expect, test } from '@jest/globals';

import { validateNickname } from '@/features/profile/nicknameValidation';
import type { NicknameValidationError } from '@/features/profile/nicknameValidation';

const invalidCases: Array<[string, NicknameValidationError]> = [
  ['', 'required'],
  ['ab', 'too_short'],
  ['a'.repeat(16), 'too_long'],
  ['ab!', 'invalid_characters'],
];

describe('nickname validation', () => {
  test('accepts and trims a contract-valid nickname', () => {
    expect(validateNickname('  Courier_1  ')).toEqual({ isValid: true, value: 'Courier_1' });
  });

  test.each(invalidCases)('rejects invalid nickname %#', (input, error) => {
    expect(validateNickname(input)).toEqual({ isValid: false, error });
  });
});
