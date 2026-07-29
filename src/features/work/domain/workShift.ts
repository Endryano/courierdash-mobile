export type WorkShiftSummary = {
  readonly id: number;
  readonly date: string;
  readonly hours: number;
  readonly km: number;
};

export type NullableAnalyticsPlatform = {
  readonly income: number;
  readonly orders: number | null;
  readonly appTips: number | null;
  readonly cashTips: number;
  readonly bonuses: number | null;
};

export type NumericAnalyticsPlatform = {
  readonly income: number;
  readonly orders: number;
  readonly appTips: number;
  readonly cashTips: number;
  readonly bonuses: number;
};

export type OtherAnalyticsPlatform = NumericAnalyticsPlatform & {
  readonly name: string | null;
};

export type WorkShiftAnalytics = {
  readonly platforms: {
    readonly uber: NullableAnalyticsPlatform;
    readonly wolt: NullableAnalyticsPlatform;
    readonly bolt: NullableAnalyticsPlatform;
    readonly glovo: NullableAnalyticsPlatform;
    readonly stuart: NumericAnalyticsPlatform;
    readonly other: OtherAnalyticsPlatform;
  };
};

export type WorkShift = WorkShiftSummary & {
  readonly analytics: WorkShiftAnalytics;
};

export type SafeWorkError = 'network_unavailable' | 'forbidden' | 'invalid_response' | 'unknown';

export type WorkShiftsState =
  | { status: 'idle'; shifts: readonly WorkShift[] }
  | { status: 'loading'; shifts: readonly WorkShift[] }
  | { status: 'empty'; shifts: readonly WorkShift[] }
  | { status: 'ready'; shifts: readonly WorkShift[] }
  | { status: 'recoverable_error'; shifts: readonly WorkShift[]; error: SafeWorkError }
  | { status: 'blocked'; shifts: readonly WorkShift[]; error: SafeWorkError };
