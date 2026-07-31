import type { WorkShiftValidationResult } from './workShiftValidation';
import { validateWorkShiftCreate } from './workShiftValidation';
import { workPlatformKeys, type OtherWorkPlatformInput, type WorkPlatformInput, type WorkShiftCreateInput } from './workShiftCreate';

export type WorkPlatformDraft = {
  enabled: boolean;
  income: string;
  orders: string;
  appTips: string;
  cashTips: string;
  bonuses: string;
};

export type WorkShiftCreateDraft = {
  date: string;
  km: string;
  hours: string;
  platforms: Record<(typeof workPlatformKeys)[number], WorkPlatformDraft> & { other: WorkPlatformDraft & { name: string } };
};

const numericMetrics = ['income', 'orders', 'appTips', 'cashTips', 'bonuses'] as const;

function createPlatformDraft(): WorkPlatformDraft {
  return { enabled: false, income: '0', orders: '0', appTips: '0', cashTips: '0', bonuses: '0' };
}

export function createEmptyWorkShiftCreateDraft(): WorkShiftCreateDraft {
  const platform = createPlatformDraft;
  return {
    date: '',
    km: '0',
    hours: '0',
    platforms: { uber: platform(), wolt: platform(), bolt: platform(), glovo: platform(), stuart: platform(), other: { ...platform(), name: '' } },
  };
}

function parseNumericText(value: string): number | null {
  const normalized = value.trim();
  if (!/^-?\d+(?:[.,]\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePlatform(platform: WorkPlatformDraft): WorkPlatformInput | null {
  if (!platform.enabled) return { enabled: false, income: 0, orders: 0, appTips: 0, cashTips: 0, bonuses: 0 };

  const values = Object.fromEntries(numericMetrics.map((metric) => [metric, parseNumericText(platform[metric])])) as Record<(typeof numericMetrics)[number], number | null>;
  if (numericMetrics.some((metric) => values[metric] === null)) return null;
  return { enabled: true, income: values.income!, orders: values.orders!, appTips: values.appTips!, cashTips: values.cashTips!, bonuses: values.bonuses! };
}

export function validateWorkShiftCreateDraft(draft: WorkShiftCreateDraft): WorkShiftValidationResult {
  const km = parseNumericText(draft.km);
  const hours = parseNumericText(draft.hours);
  const uber = parsePlatform(draft.platforms.uber);
  const wolt = parsePlatform(draft.platforms.wolt);
  const bolt = parsePlatform(draft.platforms.bolt);
  const glovo = parsePlatform(draft.platforms.glovo);
  const stuart = parsePlatform(draft.platforms.stuart);
  const other = parsePlatform(draft.platforms.other);

  if (km === null || hours === null || uber === null || wolt === null || bolt === null || glovo === null || stuart === null || other === null) {
    return { isValid: false, error: 'invalid_number' };
  }

  const input: WorkShiftCreateInput = {
    date: draft.date,
    km,
    hours,
    platforms: { uber, wolt, bolt, glovo, stuart, other: { ...other, name: draft.platforms.other.name } as OtherWorkPlatformInput },
  };
  return validateWorkShiftCreate(input);
}
