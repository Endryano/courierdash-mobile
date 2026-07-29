import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

import type { ValidatedWorkShiftCreateInput, WorkPlatformInput } from '../domain/workShiftCreate';
import type { ValidatedWorkShiftEdit } from '../domain/workShiftEdit';

export type WorkShiftMutationErrorCategory = 'duplicate_date' | 'validation' | 'recoverable' | 'blocked' | 'unknown';
export class WorkShiftMutationError extends Error {
  constructor(readonly category: WorkShiftMutationErrorCategory) { super('Work shift mutation failed.'); }
}

type WorkShiftInsert = Omit<Database['public']['Tables']['work_shifts']['Insert'], 'id' | 'created_at' | 'tips' | 'bonuses'>;
type WorkShiftUpdate = Pick<Database['public']['Tables']['work_shifts']['Update'], 'date' | 'km' | 'hours' | 'uber' | 'orders_uber' | 'tips_uber' | 'cash_tips_uber' | 'bonuses_uber' | 'wolt' | 'orders_wolt' | 'tips_wolt' | 'cash_tips_wolt' | 'bonuses_wolt' | 'bolt' | 'orders_bolt' | 'tips_bolt' | 'cash_tips_bolt' | 'bonuses_bolt' | 'glovo' | 'orders_glovo' | 'tips_glovo' | 'cash_tips_glovo' | 'bonuses_glovo' | 'stuart' | 'orders_stuart' | 'tips_stuart' | 'cash_tips_stuart' | 'bonuses_stuart' | 'other_income' | 'orders_other' | 'tips_other' | 'cash_tips_other' | 'bonuses_other' | 'other_platform_name'>;
const zeroMetrics = { income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 } satisfies Omit<WorkPlatformInput, 'enabled'>;
function metrics(platform: WorkPlatformInput) { return platform.enabled ? platform : { ...zeroMetrics, enabled: false }; }

export function toWorkShiftInsertPayload(userId: string, input: ValidatedWorkShiftCreateInput): WorkShiftInsert {
  const uber = metrics(input.platforms.uber); const wolt = metrics(input.platforms.wolt); const bolt = metrics(input.platforms.bolt); const glovo = metrics(input.platforms.glovo); const stuart = metrics(input.platforms.stuart); const other = metrics(input.platforms.other);
  return {
    user_id: userId, date: input.date, km: input.km, hours: input.hours,
    uber: uber.income, orders_uber: uber.orders, tips_uber: uber.appTips, cash_tips_uber: uber.cashTips, bonuses_uber: uber.bonuses,
    wolt: wolt.income, orders_wolt: wolt.orders, tips_wolt: wolt.appTips, cash_tips_wolt: wolt.cashTips, bonuses_wolt: wolt.bonuses,
    bolt: bolt.income, orders_bolt: bolt.orders, tips_bolt: bolt.appTips, cash_tips_bolt: bolt.cashTips, bonuses_bolt: bolt.bonuses,
    glovo: glovo.income, orders_glovo: glovo.orders, tips_glovo: glovo.appTips, cash_tips_glovo: glovo.cashTips, bonuses_glovo: glovo.bonuses,
    stuart: stuart.income, orders_stuart: stuart.orders, tips_stuart: stuart.appTips, cash_tips_stuart: stuart.cashTips, bonuses_stuart: stuart.bonuses,
    other_income: other.income, orders_other: other.orders, tips_other: other.appTips, cash_tips_other: other.cashTips, bonuses_other: other.bonuses,
    other_platform_name: input.platforms.other.enabled ? input.platforms.other.name : null,
  };
}

export function toWorkShiftUpdatePayload(input: ValidatedWorkShiftEdit): WorkShiftUpdate {
  const { uber, wolt, bolt, glovo, stuart, other } = input.platforms;
  return { date: input.date, km: input.km, hours: input.hours,
    uber: uber.income, orders_uber: uber.orders, tips_uber: uber.appTips, cash_tips_uber: uber.cashTips, bonuses_uber: uber.bonuses,
    wolt: wolt.income, orders_wolt: wolt.orders, tips_wolt: wolt.appTips, cash_tips_wolt: wolt.cashTips, bonuses_wolt: wolt.bonuses,
    bolt: bolt.income, orders_bolt: bolt.orders, tips_bolt: bolt.appTips, cash_tips_bolt: bolt.cashTips, bonuses_bolt: bolt.bonuses,
    glovo: glovo.income, orders_glovo: glovo.orders, tips_glovo: glovo.appTips, cash_tips_glovo: glovo.cashTips, bonuses_glovo: glovo.bonuses,
    stuart: stuart.income, orders_stuart: stuart.orders ?? 0, tips_stuart: stuart.appTips ?? 0, cash_tips_stuart: stuart.cashTips, bonuses_stuart: stuart.bonuses ?? 0,
    other_income: other.income, orders_other: other.orders ?? 0, tips_other: other.appTips ?? 0, cash_tips_other: other.cashTips, bonuses_other: other.bonuses ?? 0, other_platform_name: other.name,
  };
}

export function classifyWorkShiftMutationError(error: unknown): WorkShiftMutationErrorCategory {
  const candidate = error as { code?: string; constraint?: string; status?: number; message?: string };
  const message = candidate?.message?.toLowerCase() ?? '';
  if (candidate?.code === '23505' && candidate?.constraint === 'work_shifts_user_date_key') return 'duplicate_date';
  if (candidate?.code === '42501' || candidate?.status === 401 || candidate?.status === 403 || message.includes('permission')) return 'blocked';
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) return 'recoverable';
  return 'unknown';
}

export async function createOwnWorkShift(userId: string, input: ValidatedWorkShiftCreateInput): Promise<void> {
  const { error } = await supabase.from('work_shifts').insert(toWorkShiftInsertPayload(userId, input));
  if (error) throw new WorkShiftMutationError(classifyWorkShiftMutationError(error));
}

export async function updateOwnWorkShift(userId: string, shiftId: number, input: ValidatedWorkShiftEdit): Promise<void> {
  if (!Number.isInteger(shiftId) || shiftId <= 0) throw new WorkShiftMutationError('blocked');
  const { data, error } = await supabase.from('work_shifts').update(toWorkShiftUpdatePayload(input)).eq('id', shiftId).eq('user_id', userId).select('id');
  if (error) throw new WorkShiftMutationError(classifyWorkShiftMutationError(error));
  if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== shiftId) throw new WorkShiftMutationError('blocked');
}
