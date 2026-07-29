import type { TranslationKey } from '@/i18n/translations';

import { ProfileApiError } from './profileApi';

export function mapNicknameError(error: unknown): Extract<TranslationKey, `profile.nickname.error.${string}`> {
  const category = error instanceof ProfileApiError ? error.category : 'unknown';

  if (category === 'nickname_conflict') return 'profile.nickname.error.conflict';
  if (category === 'network_unavailable') return 'profile.nickname.error.network';
  if (category === 'forbidden') return 'profile.nickname.error.forbidden';
  return 'profile.nickname.error.unknown';
}
