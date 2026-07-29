export type WorkShift = {
  id: number;
  date: string;
  hours: number;
  km: number;
};

export type SafeWorkError = 'network_unavailable' | 'forbidden' | 'invalid_response' | 'unknown';

export type WorkShiftsState =
  | { status: 'idle'; shifts: readonly WorkShift[] }
  | { status: 'loading'; shifts: readonly WorkShift[] }
  | { status: 'empty'; shifts: readonly WorkShift[] }
  | { status: 'ready'; shifts: readonly WorkShift[] }
  | { status: 'recoverable_error'; shifts: readonly WorkShift[]; error: SafeWorkError }
  | { status: 'blocked'; shifts: readonly WorkShift[]; error: SafeWorkError };
