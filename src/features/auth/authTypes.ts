import type { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
};
