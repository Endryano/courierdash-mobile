import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

import type { SafeWorkError, WorkShift } from '../domain/workShift';

type WorkShiftRow = Pick<Database['public']['Tables']['work_shifts']['Row'], 'id' | 'date' | 'hours' | 'km'>;

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

function isWorkShiftRow(value: unknown): value is WorkShiftRow {
  const candidate = value as Partial<WorkShiftRow> | null;

  return typeof candidate?.id === 'number'
    && Number.isFinite(candidate.id)
    && isDateOnly(candidate.date)
    && typeof candidate.hours === 'number'
    && Number.isFinite(candidate.hours)
    && typeof candidate.km === 'number'
    && Number.isFinite(candidate.km);
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function mapWorkShift(row: WorkShiftRow): WorkShift {
  return { id: row.id, date: row.date, hours: row.hours, km: row.km };
}

export async function getOwnWorkShifts(userId: string): Promise<readonly WorkShift[]> {
  const { data, error } = await supabase
    .from('work_shifts')
    .select('id, date, hours, km')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw new WorkShiftsApiError(classifyWorkShiftsError(error));
  if (!Array.isArray(data) || !data.every(isWorkShiftRow)) throw new WorkShiftsApiError('invalid_response');

  return data.map(mapWorkShift);
}
