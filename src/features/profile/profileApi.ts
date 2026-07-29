import { supabase } from '@/lib/supabase/client';

import type { Profile, SafeProfileError, ValidNickname } from './profileTypes';

const nicknamePattern = /^[A-Za-z0-9_]{3,15}$/;

export class ProfileApiError extends Error {
  constructor(readonly category: SafeProfileError) {
    super('Profile request failed.');
  }
}

export function classifyProfileError(error: unknown): SafeProfileError {
  const candidate = error as { code?: string; status?: number; message?: string };
  const code = candidate?.code ?? '';
  const message = candidate?.message?.toLowerCase() ?? '';

  if (code === '23505') return 'nickname_conflict';
  if (code === '42501' || candidate?.status === 401 || candidate?.status === 403 || message.includes('permission')) return 'forbidden';
  if (message.includes('network') || message.includes('fetch')) return 'network_unavailable';
  return 'unknown';
}

function isProfile(value: unknown): value is Profile {
  const candidate = value as { id?: unknown; nickname?: unknown };
  return typeof candidate?.id === 'string' && (typeof candidate.nickname === 'string' || candidate.nickname === null);
}

export async function getOwnProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('id, nickname').eq('id', userId).maybeSingle();

  if (error) throw new ProfileApiError(classifyProfileError(error));
  if (data === null) return null;
  if (!isProfile(data) || data.id !== userId) throw new ProfileApiError('invalid_response');

  return data;
}

export async function upsertOwnProfile(userId: string, nickname: ValidNickname): Promise<void> {
  if (typeof nickname !== 'string' || !nicknamePattern.test(nickname)) throw new ProfileApiError('invalid_response');

  const { error } = await supabase.from('profiles').upsert({ id: userId, nickname }, { onConflict: 'id' });

  if (error) throw new ProfileApiError(classifyProfileError(error));
}
