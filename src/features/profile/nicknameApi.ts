import { upsertOwnProfile } from './profileApi';
import type { ValidNickname } from './profileTypes';

export function saveOwnNickname(authenticatedUserId: string, nickname: ValidNickname): Promise<void> {
  return upsertOwnProfile(authenticatedUserId, nickname);
}
