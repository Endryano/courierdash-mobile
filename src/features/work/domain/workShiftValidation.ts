import type { ValidatedWorkShiftCreateInput, WorkPlatformInput, WorkShiftCreateInput } from './workShiftCreate';

export type WorkShiftValidationError = 'invalid_date' | 'no_platform' | 'invalid_number' | 'negative_number' | 'fractional_orders' | 'other_name_required';
export type WorkShiftValidationResult =
  | { isValid: true; value: ValidatedWorkShiftCreateInput }
  | { isValid: false; error: WorkShiftValidationError };

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateMetrics(platform: WorkPlatformInput): WorkShiftValidationError | null {
  const values = [platform.income, platform.orders, platform.appTips, platform.cashTips, platform.bonuses];
  if (!values.every(Number.isFinite)) return 'invalid_number';
  if (values.some((value) => value < 0)) return 'negative_number';
  if (!Number.isInteger(platform.orders)) return 'fractional_orders';
  return null;
}

export function validateWorkShiftCreate(input: WorkShiftCreateInput): WorkShiftValidationResult {
  if (!isDateOnly(input.date)) return { isValid: false, error: 'invalid_date' };
  if (!Number.isFinite(input.km) || !Number.isFinite(input.hours)) return { isValid: false, error: 'invalid_number' };
  if (input.km < 0 || input.hours < 0) return { isValid: false, error: 'negative_number' };

  const platforms = Object.values(input.platforms);
  if (!platforms.some((platform) => platform.enabled)) return { isValid: false, error: 'no_platform' };

  for (const platform of platforms) {
    const error = validateMetrics(platform);
    if (error) return { isValid: false, error };
  }

  const other = input.platforms.other;
  const otherName = other.name.trim();
  const otherHasMetrics = [other.income, other.orders, other.appTips, other.cashTips, other.bonuses].some((value) => value !== 0);
  if ((other.enabled || otherHasMetrics) && !otherName) return { isValid: false, error: 'other_name_required' };

  return { isValid: true, value: { ...input, platforms: { ...input.platforms, other: { ...other, name: otherName } }, __validated: true } };
}
