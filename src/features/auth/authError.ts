import type { TranslationKey } from '@/i18n/translations';

export type AuthErrorKey = Extract<TranslationKey, `auth.error.${string}` | 'auth.invalidEmail'>;

export function mapAuthError(error: unknown): AuthErrorKey {
  const candidate = error as { code?: string; status?: number; message?: string };
  const code = candidate?.code?.toLowerCase() ?? '';
  const message = candidate?.message?.toLowerCase() ?? '';
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'auth.error.invalidCredentials';
  if (message.includes('already registered') || message.includes('already been registered')) return 'auth.error.accountExists';
  if (code.includes('rate') || candidate?.status === 429) return 'auth.error.rateLimit';
  if (message.includes('network') || message.includes('fetch')) return 'auth.error.network';
  if (message.includes('password')) return 'auth.error.weakPassword';
  if (message.includes('email')) return 'auth.invalidEmail';
  return 'auth.error.generic';
}
