export const workPlatformKeys = ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other'] as const;
export type WorkPlatformKey = (typeof workPlatformKeys)[number];

export type WorkPlatformInput = {
  enabled: boolean;
  income: number;
  orders: number;
  appTips: number;
  cashTips: number;
  bonuses: number;
};

export type OtherWorkPlatformInput = WorkPlatformInput & { name: string };

export type WorkShiftCreateInput = {
  date: string;
  km: number;
  hours: number;
  platforms: {
    uber: WorkPlatformInput;
    wolt: WorkPlatformInput;
    bolt: WorkPlatformInput;
    glovo: WorkPlatformInput;
    stuart: WorkPlatformInput;
    other: OtherWorkPlatformInput;
  };
};

export type ValidatedWorkShiftCreateInput = WorkShiftCreateInput & { readonly __validated: true };

export function createEmptyWorkShiftInput(): WorkShiftCreateInput {
  const platform = (): WorkPlatformInput => ({ enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 });

  return { date: '', km: 0, hours: 0, platforms: { uber: platform(), wolt: platform(), bolt: platform(), glovo: platform(), stuart: platform(), other: { ...platform(), name: '' } } };
}
