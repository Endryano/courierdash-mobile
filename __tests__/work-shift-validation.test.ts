import { describe, expect, test } from '@jest/globals';

import { createEmptyWorkShiftInput } from '@/features/work/domain/workShiftCreate';
import { validateWorkShiftCreate } from '@/features/work/domain/workShiftValidation';

function validInput() {
  const input = createEmptyWorkShiftInput();
  input.date = '2026-07-29';
  input.platforms.uber.enabled = true;
  return input;
}

describe('work shift create validation', () => {
  test('accepts a minimal verified input', () => {
    expect(validateWorkShiftCreate(validInput()).isValid).toBe(true);
  });

  test('accepts zero values and leap-day calendar dates without changing the local date string', () => {
    const input = validInput(); input.date = '2024-02-29';
    expect(validateWorkShiftCreate(input)).toMatchObject({ isValid: true, value: expect.objectContaining({ date: '2024-02-29', km: 0, hours: 0 }) });
  });

  test.each([
    ['2026/07/29', 'invalid_date'],
    ['2026-02-30', 'invalid_date'],
    ['2025-02-29', 'invalid_date'],
    ['2026-13-01', 'invalid_date'],
    ['2026-04-31', 'invalid_date'],
    ['2026-7-09', 'invalid_date'],
    ['2026-07-29T00:00:00Z', 'invalid_date'],
    [' 2026-07-29 ', 'invalid_date'],
  ])('rejects invalid calendar dates', (date, error) => {
    const input = validInput(); input.date = date;
    expect(validateWorkShiftCreate(input)).toMatchObject({ isValid: false, error });
  });

  test.each([
    [(input: ReturnType<typeof validInput>) => { input.km = -1; }, 'negative_number'],
    [(input: ReturnType<typeof validInput>) => { input.hours = Number.NaN; }, 'invalid_number'],
    [(input: ReturnType<typeof validInput>) => { input.platforms.uber.orders = 1.5; }, 'fractional_orders'],
    [(input: ReturnType<typeof validInput>) => { input.platforms.uber.income = Number.POSITIVE_INFINITY; }, 'invalid_number'],
    [(input: ReturnType<typeof validInput>) => { input.platforms.uber.cashTips = -0.01; }, 'negative_number'],
  ])('rejects invalid numeric values', (mutate, error) => {
    const input = validInput(); mutate(input);
    expect(validateWorkShiftCreate(input)).toMatchObject({ isValid: false, error });
  });

  test('requires one enabled platform and trims Other names', () => {
    const disabled = createEmptyWorkShiftInput(); disabled.date = '2026-07-29';
    expect(validateWorkShiftCreate(disabled)).toMatchObject({ isValid: false, error: 'no_platform' });

    const other = validInput(); other.platforms.uber.enabled = false; other.platforms.other.enabled = true; other.platforms.other.name = '  Other App  ';
    expect(validateWorkShiftCreate(other)).toMatchObject({ isValid: true, value: expect.objectContaining({ platforms: expect.objectContaining({ other: expect.objectContaining({ name: 'Other App' }) }) }) });
  });

  test('requires a non-whitespace Other name whenever Other is enabled or has metrics', () => {
    const enabledOther = validInput(); enabledOther.platforms.uber.enabled = false; enabledOther.platforms.other.enabled = true; enabledOther.platforms.other.name = '   ';
    expect(validateWorkShiftCreate(enabledOther)).toMatchObject({ isValid: false, error: 'other_name_required' });

    const staleOtherMetrics = validInput(); staleOtherMetrics.platforms.other.income = 1;
    expect(validateWorkShiftCreate(staleOtherMetrics)).toMatchObject({ isValid: false, error: 'other_name_required' });
  });
});
