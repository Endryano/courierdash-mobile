import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getOwnWorkShiftById, WorkShiftDetailError } from '../api/workShiftDetailsApi';
import { WorkShiftMutationError, updateOwnWorkShift } from '../api/workShiftMutationsApi';
import type { WorkShiftEditInput } from '../domain/workShiftEdit';
import { toWorkShiftEditInput } from '../domain/workShiftEdit';
import { validateWorkShiftEdit } from '../domain/workShiftEditValidation';
import { useWorkShifts } from '../hooks/useWorkShifts';
import { WorkShiftEditContext, type WorkShiftEditState } from './workShiftEditContext';
const idle: WorkShiftEditState = { status: 'idle' };
export function WorkShiftEditProvider({ children }: PropsWithChildren) {
 const { session,status,user }=useAuth(); const { retry }=useWorkShifts(); const userId=status==='authenticated'&&session&&user?user.id:null; const [state,setState]=useState<WorkShiftEditState>(idle); const subject=useRef<string|null>(userId); const version=useRef(0); const pending=useRef(false);
 useEffect(()=>{ if(subject.current!==userId){subject.current=userId;version.current+=1;pending.current=false;setState(idle);} },[userId]); useEffect(()=>()=>{version.current+=1;},[]);
 const reset=useCallback(()=>{if(!pending.current){version.current+=1;setState(idle);}},[]);
 const load=useCallback(async(shiftId:number)=>{if(!userId||pending.current)return; const id=++version.current; pending.current=true;setState({status:'loading'}); try{const shift=await getOwnWorkShiftById(userId,shiftId);if(version.current===id&&subject.current===userId)setState({status:'ready',shift,input:toWorkShiftEditInput(shift)});}catch(error){if(version.current!==id||subject.current!==userId)return; const category=error instanceof WorkShiftDetailError?error.category:'recoverable';setState(category==='not_found'?{status:'not_found'}:category==='blocked'?{status:'blocked'}:{status:'recoverable_error'});}finally{if(version.current===id)pending.current=false;}},[userId]);
 const submit=useCallback(async(input:WorkShiftEditInput)=>{if(!userId||pending.current||!('shift' in state))return;const validation=validateWorkShiftEdit(input);if(!validation.isValid){setState({status:'validation_error',shift:state.shift,input,error:validation.error});return;}const id=++version.current;const shift=state.shift;pending.current=true;setState({status:'submitting',shift,input});let updated=false;try{await updateOwnWorkShift(userId,shift.id,validation.value);updated=true;if(version.current!==id||subject.current!==userId)return;await retry();if(version.current===id&&subject.current===userId)setState({status:'success'});}catch(error){if(version.current!==id||subject.current!==userId)return;if(updated){setState({status:'reconciliation_required',shift,input});return;}const category=error instanceof WorkShiftMutationError?error.category:'recoverable';setState(category==='duplicate_date'?{status:'duplicate_date',shift,input}:category==='blocked'?{status:'blocked'}:{status:'recoverable_error'});}finally{if(version.current===id)pending.current=false;}},[retry,state,userId]);
 const reconcile=useCallback(async()=>{if(!userId||pending.current||state.status!=='reconciliation_required')return;const id=++version.current;pending.current=true;setState({status:'submitting',shift:state.shift,input:state.input});try{await retry();if(version.current===id&&subject.current===userId)setState({status:'success'});}catch{if(version.current===id&&subject.current===userId)setState({status:'reconciliation_required',shift:state.shift,input:state.input});}finally{if(version.current===id)pending.current=false;}},[retry,state,userId]);
 const value=useMemo(()=>({...state,load,submit,reconcile,reset,subjectUserId:userId}),[load,reconcile,reset,state,submit,userId]); return <WorkShiftEditContext.Provider value={value}>{children}</WorkShiftEditContext.Provider>;
}
