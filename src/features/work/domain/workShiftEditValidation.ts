import type { EditableMetric, EditablePlatform } from './workShiftEditable';
import type { ValidatedWorkShiftEdit, WorkShiftEditInput } from './workShiftEdit';
import type { WorkShiftValidationError } from './workShiftValidation';

export type WorkShiftEditValidationResult =
  | { isValid: true; value: ValidatedWorkShiftEdit }
  | { isValid: false; error: WorkShiftValidationError };

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validMetric(value: EditableMetric): boolean { return value === null || (Number.isFinite(value) && value >= 0); }
function validPlatform(platform: EditablePlatform): WorkShiftValidationError | null {
  const values = [platform.income, platform.orders, platform.appTips, platform.cashTips, platform.bonuses];
  if (!values.every(validMetric)) return 'invalid_number';
  if (platform.orders !== null && !Number.isInteger(platform.orders)) return 'fractional_orders';
  return null;
}
function hasValues(platform: EditablePlatform): boolean {
  return [platform.income, platform.orders, platform.appTips, platform.cashTips, platform.bonuses].some((value) => value !== null && value !== 0);
}

export function validateWorkShiftEdit(input: WorkShiftEditInput): WorkShiftEditValidationResult {
  if (!isDateOnly(input.date)) return { isValid: false, error: 'invalid_date' };
  if (!Number.isFinite(input.km) || !Number.isFinite(input.hours) || input.km < 0 || input.hours < 0) return { isValid: false, error: 'invalid_number' };
  const platforms = Object.values(input.platforms);
  if (!platforms.some((platform) => platform.enabled || hasValues(platform))) return { isValid: false, error: 'no_platform' };
  for (const platform of platforms) { const error = validPlatform(platform); if (error) return { isValid: false, error }; }
  for (const platform of [input.platforms.stuart, input.platforms.other]) {
    if (platform.orders === null || platform.appTips === null || platform.bonuses === null) return { isValid: false, error: 'invalid_number' };
  }
  const other = input.platforms.other;
  const name = other.name?.trim() ?? null;
  if ((other.enabled || hasValues(other)) && name === null) return { isValid: false, error: 'other_name_required' };
  return { isValid: true, value: { ...input, platforms: { ...input.platforms, other: { ...other, name } }, __validatedEdit: true } };
}
