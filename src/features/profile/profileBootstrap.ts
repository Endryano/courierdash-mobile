import { ProfileApiError, getOwnProfile, upsertOwnProfile } from './profileApi';
import type { Profile, ProfileBootstrapState, SafeProfileError, ValidNickname } from './profileTypes';

export const PROFILE_METADATA_NICKNAME_KEY = 'nickname';
const nicknamePattern = /^[A-Za-z0-9_]{3,15}$/;

type BootstrapDependencies = {
  getOwnProfile: typeof getOwnProfile;
  upsertOwnProfile: typeof upsertOwnProfile;
};

const defaultDependencies: BootstrapDependencies = { getOwnProfile, upsertOwnProfile };

export function getValidMetadataNickname(metadata: unknown): ValidNickname | null {
  if (typeof metadata !== 'object' || metadata === null) return null;

  const value = (metadata as Record<string, unknown>)[PROFILE_METADATA_NICKNAME_KEY];
  if (typeof value !== 'string') return null;

  const nickname = value.trim();
  return nicknamePattern.test(nickname) ? (nickname as ValidNickname) : null;
}

function isValidProfileNickname(profile: Profile): boolean {
  return getValidMetadataNickname({ [PROFILE_METADATA_NICKNAME_KEY]: profile.nickname }) !== null;
}

function classifyFailure(error: unknown): ProfileBootstrapState {
  const category: SafeProfileError = error instanceof ProfileApiError ? error.category : 'unknown';

  if (category === 'nickname_conflict') {
    return { status: 'needs_nickname', profile: null, reason: 'nickname_conflict' };
  }

  if (category === 'network_unavailable') {
    return { status: 'recoverable_error', profile: null, error: category };
  }

  return { status: 'blocked', profile: null, error: category };
}

export async function bootstrapProfile(
  userId: string,
  userMetadata: unknown,
  dependencies: BootstrapDependencies = defaultDependencies,
): Promise<ProfileBootstrapState> {
  try {
    const profile = await dependencies.getOwnProfile(userId);
    const metadataNickname = getValidMetadataNickname(userMetadata);

    if (profile !== null && isValidProfileNickname(profile)) {
      return { status: 'ready', profile };
    }

    if (metadataNickname === null) {
      return profile === null
        ? { status: 'needs_nickname', profile: null, reason: 'missing_profile' }
        : { status: 'needs_nickname', profile, reason: 'missing_nickname' };
    }

    await dependencies.upsertOwnProfile(userId, metadataNickname);
    const repairedProfile = await dependencies.getOwnProfile(userId);

    if (repairedProfile === null || !isValidProfileNickname(repairedProfile)) {
      return { status: 'blocked', profile: null, error: 'invalid_response' };
    }

    return { status: 'ready', profile: repairedProfile };
  } catch (error) {
    return classifyFailure(error);
  }
}
