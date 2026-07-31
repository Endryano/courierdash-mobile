import { describe, expect, test } from '@jest/globals';

import { createEmptyWorkShiftCreateDraft, validateWorkShiftCreateDraft } from '@/features/work/domain/workShiftCreateDraft';

function validDraft() {
  const draft = createEmptyWorkShiftCreateDraft();
  draft.date = '2026-07-29';
  draft.platforms.uber.enabled = true;
  return draft;
}

describe('work shift create draft validation', () => {
  test('accepts dot and comma decimals as the same finite values', () => {
    const comma = validDraft();
    comma.km = '12,5';
    comma.hours = '8,25';
    comma.platforms.uber.income = '100,5';
    const dot = validDraft();
    dot.km = '12.5';
    dot.hours = '8.25';
    dot.platforms.uber.income = '100.5';

    expect(validateWorkShiftCreateDraft(comma)).toMatchObject({ isValid: true, value: expect.objectContaining({ km: 12.5, hours: 8.25, platforms: expect.objectContaining({ uber: expect.objectContaining({ income: 100.5 }) }) }) });
    expect(validateWorkShiftCreateDraft(dot)).toMatchObject({ isValid: true, value: expect.objectContaining({ km: 12.5, hours: 8.25, platforms: expect.objectContaining({ uber: expect.objectContaining({ income: 100.5 }) }) }) });
  });

  test('rejects empty required numeric text without changing it to zero', () => {
    const draft = validDraft();
    draft.km = '';
    expect(validateWorkShiftCreateDraft(draft)).toEqual({ isValid: false, error: 'invalid_number' });
  });

  test('rejects fractional orders and malformed decimal text', () => {
    const fractionalOrders = validDraft();
    fractionalOrders.platforms.uber.orders = '1,5';
    expect(validateWorkShiftCreateDraft(fractionalOrders)).toEqual({ isValid: false, error: 'fractional_orders' });

    for (const malformed of ['1,2,3', '1..2', 'abc']) {
      const draft = validDraft();
      draft.hours = malformed;
      expect(validateWorkShiftCreateDraft(draft)).toEqual({ isValid: false, error: 'invalid_number' });
    }
  });

  test('ignores disabled platform draft text and keeps its validated metrics zeroed', () => {
    const draft = validDraft();
    draft.platforms.wolt.income = 'not-a-number';
    draft.platforms.wolt.orders = '1,2,3';
    expect(validateWorkShiftCreateDraft(draft)).toMatchObject({ isValid: true, value: expect.objectContaining({ platforms: expect.objectContaining({ wolt: { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 } }) }) });
  });
});
