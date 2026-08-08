import type { WorkShift } from './workShift';

export const workPlatformKeys = ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other'] as const;

export type WorkPlatformKey = (typeof workPlatformKeys)[number];

type WorkAnalyticsPlatform = WorkShift['analytics']['platforms'][WorkPlatformKey];

export function nullableContribution(value: number | null): number {
  return value ?? 0;
}

export function calculatePlatformBrutto(platform: WorkAnalyticsPlatform): number {
  return platform.income
    + nullableContribution(platform.appTips)
    + platform.cashTips
    + nullableContribution(platform.bonuses);
}

export function calculatePlatformOrders(platform: WorkAnalyticsPlatform): number {
  return nullableContribution(platform.orders);
}

export function calculateWorkShiftBrutto(shift: WorkShift): number {
  return workPlatformKeys.reduce((total, key) => total + calculatePlatformBrutto(shift.analytics.platforms[key]), 0);
}
