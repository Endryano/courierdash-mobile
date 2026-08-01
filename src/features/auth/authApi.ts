import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';

import { mapAuthError, type AuthErrorKey } from './authError';
import type { SignInInput } from './authValidation';

export class AuthApiError extends Error {
  constructor(readonly key: AuthErrorKey) {
    super('Auth request failed.');
  }
}

async function runAuthRequest(request: () => Promise<{ data: { session: Session | null }; error: unknown }>): Promise<Session | null> {
  const { data, error } = await request();
  if (error) throw new AuthApiError(mapAuthError(error));
  return data.session;
}

export function signInWithEmail(input: SignInInput): Promise<Session | null> {
  return runAuthRequest(() => supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password }));
}

export function signUpWithEmail(input: SignInInput): Promise<Session | null> {
  return runAuthRequest(() => supabase.auth.signUp({ email: input.email.trim(), password: input.password }));
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthApiError(mapAuthError(error));
  }
}
