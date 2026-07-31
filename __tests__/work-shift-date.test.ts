import { describe, expect, test } from '@jest/globals';

import { formatWorkShiftDate, fromCanonicalWorkShiftDate, isCanonicalWorkShiftDate, toCanonicalWorkShiftDate } from '@/features/work/domain/workShiftDate';

describe('work shift local date helpers', () => {
  test.each(['2026-01-05', '2026-12-31', '2024-02-29'])('accepts canonical local calendar dates', (value) => {
    expect(isCanonicalWorkShiftDate(value)).toBe(true);
    expect(toCanonicalWorkShiftDate(fromCanonicalWorkShiftDate(value)!)).toBe(value);
  });

  test.each(['2026-02-29', '2026-13-01', '2026-7-01', 'invalid'])('rejects malformed canonical dates', (value) => {
    expect(fromCanonicalWorkShiftDate(value)).toBeNull();
  });

  test('uses local calendar getters without UTC shifting near midnight', () => {
    expect(toCanonicalWorkShiftDate(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(toCanonicalWorkShiftDate(new Date(2026, 11, 31, 23, 55))).toBe('2026-12-31');
  });

  test('formats a canonical value for the requested locale without changing persistence value', () => {
    expect(formatWorkShiftDate('2026-07-31', 'en')).toContain('2026');
    expect(formatWorkShiftDate('invalid', 'en')).toBeNull();
  });
});
