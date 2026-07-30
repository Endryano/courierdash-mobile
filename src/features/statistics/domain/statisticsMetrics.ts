import type { WorkShift } from '@/features/work/domain/workShift';
import {
  calculatePlatformBrutto,
  calculatePlatformOrders,
  nullableContribution,
  workPlatformKeys,
  type WorkPlatformKey,
} from '@/features/work/domain/workShiftAnalytics';

export type StatisticsPlatformMetrics = {
  readonly brutto: number;
  readonly orders: number;
};

export type StatisticsMetrics = {
  readonly totalBrutto: number;
  readonly baseIncome: number;
  readonly appTips: number;
  readonly cashTips: number;
  readonly bonuses: number;
  readonly orders: number;
  readonly workedTime: number;
  readonly distance: number;
  readonly shiftCount: number;
  readonly platforms: Readonly<Record<WorkPlatformKey, StatisticsPlatformMetrics>>;
};

function emptyPlatformMetrics(): Record<WorkPlatformKey, StatisticsPlatformMetrics> {
  return {
    uber: { brutto: 0, orders: 0 },
    wolt: { brutto: 0, orders: 0 },
    bolt: { brutto: 0, orders: 0 },
    glovo: { brutto: 0, orders: 0 },
    stuart: { brutto: 0, orders: 0 },
    other: { brutto: 0, orders: 0 },
  };
}

export function calculateStatisticsMetrics(shifts: readonly WorkShift[]): StatisticsMetrics {
  const platforms = emptyPlatformMetrics();
  let baseIncome = 0;
  let appTips = 0;
  let cashTips = 0;
  let bonuses = 0;
  let totalBrutto = 0;
  let orders = 0;
  let workedTime = 0;
  let distance = 0;

  for (const shift of shifts) {
    workedTime += shift.hours;
    distance += shift.km;

    for (const key of workPlatformKeys) {
      const platform = shift.analytics.platforms[key];
      const brutto = calculatePlatformBrutto(platform);
      const platformOrders = calculatePlatformOrders(platform);

      totalBrutto += brutto;
      baseIncome += platform.income;
      appTips += nullableContribution(platform.appTips);
      cashTips += platform.cashTips;
      bonuses += nullableContribution(platform.bonuses);
      orders += platformOrders;
      platforms[key] = {
        brutto: platforms[key].brutto + brutto,
        orders: platforms[key].orders + platformOrders,
      };
    }
  }

  return {
    totalBrutto,
    baseIncome,
    appTips,
    cashTips,
    bonuses,
    orders,
    workedTime,
    distance,
    shiftCount: shifts.length,
    platforms,
  };
}
