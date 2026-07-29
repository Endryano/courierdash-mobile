export type Profile = {
  id: string;
  nickname: string | null;
};

export type SafeProfileError =
  | 'network_unavailable'
  | 'nickname_conflict'
  | 'forbidden'
  | 'invalid_response'
  | 'unknown';

export type ProfileBootstrapState =
  | { status: 'idle'; profile: null }
  | { status: 'loading'; profile: null }
  | { status: 'ready'; profile: Profile }
  | {
      status: 'needs_nickname';
      profile: Profile | null;
      reason: 'missing_profile' | 'missing_nickname' | 'nickname_conflict';
    }
  | { status: 'recoverable_error'; profile: null; error: SafeProfileError }
  | { status: 'blocked'; profile: null; error: SafeProfileError };

export type ValidNickname = string & { readonly __brand: 'ValidNickname' };
