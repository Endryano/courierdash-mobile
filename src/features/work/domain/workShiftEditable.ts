export const editableWorkPlatformKeys = ['uber', 'wolt', 'bolt', 'glovo', 'stuart', 'other'] as const;
export type EditableWorkPlatformKey = (typeof editableWorkPlatformKeys)[number];
export type EditableMetric = number | null;

export type EditablePlatform = {
  enabled: boolean;
  income: number;
  orders: EditableMetric;
  appTips: EditableMetric;
  cashTips: number;
  bonuses: EditableMetric;
};

export type EditableOtherPlatform = EditablePlatform & { name: string | null };

export type WorkShiftEditable = {
  id: number;
  date: string;
  km: number;
  hours: number;
  platforms: {
    uber: EditablePlatform;
    wolt: EditablePlatform;
    bolt: EditablePlatform;
    glovo: EditablePlatform;
    stuart: EditablePlatform;
    other: EditableOtherPlatform;
  };
};
