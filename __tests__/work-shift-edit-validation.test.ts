import { describe, expect, test } from '@jest/globals';
import { toWorkShiftEditInput } from '@/features/work/domain/workShiftEdit';
import type { WorkShiftEditable } from '@/features/work/domain/workShiftEditable';
import { validateWorkShiftEdit } from '@/features/work/domain/workShiftEditValidation';
import { toWorkShiftUpdatePayload } from '@/features/work/api/workShiftMutationsApi';

jest.mock('@/lib/supabase/client', () => ({ supabase: {} }));

const shift: WorkShiftEditable = { id: 1, date: '2026-07-29', km: 10, hours: 8, platforms: { uber:{enabled:true,income:11,orders:2,appTips:3,cashTips:4,bonuses:5},wolt:{enabled:false,income:6,orders:7,appTips:8,cashTips:9,bonuses:10},bolt:{enabled:false,income:0,orders:null,appTips:null,cashTips:0,bonuses:null},glovo:{enabled:false,income:0,orders:null,appTips:null,cashTips:0,bonuses:null},stuart:{enabled:false,income:0,orders:0,appTips:0,cashTips:0,bonuses:0},other:{enabled:false,income:0,orders:0,appTips:0,cashTips:0,bonuses:0,name:null}} };
describe('work shift edit validation',()=>{
 test('preserves unchanged canonical platform values even when visibility is toggled',()=>{const input=toWorkShiftEditInput(shift);input.platforms.wolt.enabled=false;const result=validateWorkShiftEdit(input);expect(result).toMatchObject({isValid:true});if(result.isValid)expect(toWorkShiftUpdatePayload(result.value)).toMatchObject({wolt:6,orders_wolt:7,tips_wolt:8,cash_tips_wolt:9,bonuses_wolt:10});});
 test.each([['2026-02-30','invalid_date'],['2026-7-01','invalid_date']])('rejects invalid date %s',(date,error)=>{const input=toWorkShiftEditInput(shift);input.date=date;expect(validateWorkShiftEdit(input)).toMatchObject({isValid:false,error});});
 test('rejects malformed values and trims Other name',()=>{const invalid=toWorkShiftEditInput(shift);invalid.platforms.uber.orders=1.5;expect(validateWorkShiftEdit(invalid)).toMatchObject({isValid:false,error:'fractional_orders'});const other=toWorkShiftEditInput(shift);other.platforms.other.enabled=true;other.platforms.other.name='  Other  ';expect(validateWorkShiftEdit(other)).toMatchObject({isValid:true,value:expect.objectContaining({platforms:expect.objectContaining({other:expect.objectContaining({name:'Other'})})})});});
 test('uses only mutable allowlisted update fields',()=>{const result=validateWorkShiftEdit(toWorkShiftEditInput(shift));if(!result.isValid)throw new Error('expected valid');const payload=toWorkShiftUpdatePayload(result.value) as Record<string,unknown>;expect(payload).not.toHaveProperty('id');expect(payload).not.toHaveProperty('user_id');expect(payload).not.toHaveProperty('created_at');expect(payload).not.toHaveProperty('tips');expect(payload).not.toHaveProperty('bonuses');});
});
