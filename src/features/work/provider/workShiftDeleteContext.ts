import { createContext } from 'react';
import type { SafeShiftSummary } from '../domain/workShiftDelete';
export type WorkShiftDeleteState = {status:'idle'}|{status:'confirming';summary:SafeShiftSummary}|{status:'deleting';summary:SafeShiftSummary}|{status:'recoverable_error';summary:SafeShiftSummary}|{status:'blocked';summary:SafeShiftSummary}|{status:'reconciliation_required';summary:SafeShiftSummary};
export type WorkShiftDeleteContextValue = WorkShiftDeleteState & {requestDelete:(summary:SafeShiftSummary)=>void;cancelDelete:()=>void;confirmDelete:()=>Promise<void>;reconcile:()=>Promise<void>;reset:()=>void;subjectUserId:string|null};
export const WorkShiftDeleteContext=createContext<WorkShiftDeleteContextValue|null>(null);
