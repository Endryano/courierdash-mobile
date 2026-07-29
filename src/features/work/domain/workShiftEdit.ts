import type { WorkShiftEditable } from './workShiftEditable';

export type WorkShiftEditInput = Omit<WorkShiftEditable, 'id'>;
export type ValidatedWorkShiftEdit = WorkShiftEditInput & { readonly __validatedEdit: true };

export function toWorkShiftEditInput(shift: WorkShiftEditable): WorkShiftEditInput {
  return { date: shift.date, km: shift.km, hours: shift.hours, platforms: { uber: { ...shift.platforms.uber }, wolt: { ...shift.platforms.wolt }, bolt: { ...shift.platforms.bolt }, glovo: { ...shift.platforms.glovo }, stuart: { ...shift.platforms.stuart }, other: { ...shift.platforms.other } } };
}
