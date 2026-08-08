import type { SupportedLocale } from '@/i18n/translations';

export function isCanonicalWorkShiftDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function toCanonicalWorkShiftDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fromCanonicalWorkShiftDate(value: string): Date | null {
  if (!isCanonicalWorkShiftDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatWorkShiftDate(value: string, locale: SupportedLocale): string | null {
  const date = fromCanonicalWorkShiftDate(value);
  return date === null ? null : new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
}

export function formatWorkShiftHistoryDate(value: string, locale: SupportedLocale): string | null {
  const date = fromCanonicalWorkShiftDate(value);
  if (date === null) return null;

  const formatted = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(date);

  return formatted.length === 0 ? null : formatted[0].toLocaleUpperCase(locale) + formatted.slice(1);
}
