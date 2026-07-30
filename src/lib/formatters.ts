import type { SupportedLocale } from '@/i18n/translations';

export function formatCurrency(locale: SupportedLocale, value: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(locale: SupportedLocale, value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}
