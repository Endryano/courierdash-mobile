import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

import type { SafeWorkError, WorkShift } from '../domain/workShift';

export const workShiftsSelect = 'id, date, hours, km, uber, orders_uber, tips_uber, cash_tips_uber, bonuses_uber, wolt, orders_wolt, tips_wolt, cash_tips_wolt, bonuses_wolt, bolt, orders_bolt, tips_bolt, cash_tips_bolt, bonuses_bolt, glovo, orders_glovo, tips_glovo, cash_tips_glovo, bonuses_glovo, stuart, orders_stuart, tips_stuart, cash_tips_stuart, bonuses_stuart, other_income, orders_other, tips_other, cash_tips_other, bonuses_other, other_platform_name' as const;

type WorkShiftRow = Pick<Database['public']['Tables']['work_shifts']['Row'],
  | 'id' | 'date' | 'hours' | 'km'
  | 'uber' | 'orders_uber' | 'tips_uber' | 'cash_tips_uber' | 'bonuses_uber'
  | 'wolt' | 'orders_wolt' | 'tips_wolt' | 'cash_tips_wolt' | 'bonuses_wolt'
  | 'bolt' | 'orders_bolt' | 'tips_bolt' | 'cash_tips_bolt' | 'bonuses_bolt'
  | 'glovo' | 'orders_glovo' | 'tips_glovo' | 'cash_tips_glovo' | 'bonuses_glovo'
  | 'stuart' | 'orders_stuart' | 'tips_stuart' | 'cash_tips_stuart' | 'bonuses_stuart'
  | 'other_income' | 'orders_other' | 'tips_other' | 'cash_tips_other' | 'bonuses_other' | 'other_platform_name'
>;

export class WorkShiftsApiError extends Error {
  constructor(readonly category: SafeWorkError) {
    super('Work shifts request failed.');
  }
}

export function classifyWorkShiftsError(error: unknown): SafeWorkError {
  const candidate = error as { code?: string; status?: number; message?: string };
  const message = candidate?.message?.toLowerCase() ?? '';

  if (candidate?.code === '42501' || candidate?.status === 401 || candidate?.status === 403 || message.includes('permission')) return 'forbidden';
  if (message.includes('network') || message.includes('fetch')) return 'network_unavailable';
  return 'unknown';
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNullableNonNegativeNumber(value: unknown): value is number | null {
  return value === null || isNonNegativeNumber(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isInteger(value);
}

function isNullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || isNonNegativeInteger(value);
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isWorkShiftRow(value: unknown): value is WorkShiftRow {
  const row = value as Partial<WorkShiftRow> | null;

  return isNonNegativeInteger(row?.id) && row.id > 0
    && isDateOnly(row.date)
    && isNonNegativeNumber(row.hours)
    && isNonNegativeNumber(row.km)
    && isNonNegativeNumber(row.uber) && isNullableNonNegativeInteger(row.orders_uber) && isNullableNonNegativeNumber(row.tips_uber) && isNonNegativeNumber(row.cash_tips_uber) && isNullableNonNegativeNumber(row.bonuses_uber)
    && isNonNegativeNumber(row.wolt) && isNullableNonNegativeInteger(row.orders_wolt) && isNullableNonNegativeNumber(row.tips_wolt) && isNonNegativeNumber(row.cash_tips_wolt) && isNullableNonNegativeNumber(row.bonuses_wolt)
    && isNonNegativeNumber(row.bolt) && isNullableNonNegativeInteger(row.orders_bolt) && isNullableNonNegativeNumber(row.tips_bolt) && isNonNegativeNumber(row.cash_tips_bolt) && isNullableNonNegativeNumber(row.bonuses_bolt)
    && isNonNegativeNumber(row.glovo) && isNullableNonNegativeInteger(row.orders_glovo) && isNullableNonNegativeNumber(row.tips_glovo) && isNonNegativeNumber(row.cash_tips_glovo) && isNullableNonNegativeNumber(row.bonuses_glovo)
    && isNonNegativeNumber(row.stuart) && isNonNegativeInteger(row.orders_stuart) && isNonNegativeNumber(row.tips_stuart) && isNonNegativeNumber(row.cash_tips_stuart) && isNonNegativeNumber(row.bonuses_stuart)
    && isNonNegativeNumber(row.other_income) && isNonNegativeInteger(row.orders_other) && isNonNegativeNumber(row.tips_other) && isNonNegativeNumber(row.cash_tips_other) && isNonNegativeNumber(row.bonuses_other)
    && (typeof row.other_platform_name === 'string' || row.other_platform_name === null);
}

export function mapWorkShift(row: WorkShiftRow): WorkShift {
  return {
    id: row.id,
    date: row.date,
    hours: row.hours,
    km: row.km,
    analytics: {
      platforms: {
        uber: { income: row.uber, orders: row.orders_uber, appTips: row.tips_uber, cashTips: row.cash_tips_uber, bonuses: row.bonuses_uber },
        wolt: { income: row.wolt, orders: row.orders_wolt, appTips: row.tips_wolt, cashTips: row.cash_tips_wolt, bonuses: row.bonuses_wolt },
        bolt: { income: row.bolt, orders: row.orders_bolt, appTips: row.tips_bolt, cashTips: row.cash_tips_bolt, bonuses: row.bonuses_bolt },
        glovo: { income: row.glovo, orders: row.orders_glovo, appTips: row.tips_glovo, cashTips: row.cash_tips_glovo, bonuses: row.bonuses_glovo },
        stuart: { income: row.stuart, orders: row.orders_stuart, appTips: row.tips_stuart, cashTips: row.cash_tips_stuart, bonuses: row.bonuses_stuart },
        other: { income: row.other_income, orders: row.orders_other, appTips: row.tips_other, cashTips: row.cash_tips_other, bonuses: row.bonuses_other, name: row.other_platform_name },
      },
    },
  };
}

export async function getOwnWorkShifts(userId: string): Promise<readonly WorkShift[]> {
  const { data, error } = await supabase
    .from('work_shifts')
    .select(workShiftsSelect)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw new WorkShiftsApiError(classifyWorkShiftsError(error));
  if (!Array.isArray(data) || !data.every(isWorkShiftRow)) throw new WorkShiftsApiError('invalid_response');

  return data.map(mapWorkShift);
}
