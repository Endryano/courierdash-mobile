import { createContext } from 'react';

import type { AuthState } from './authTypes';

export type AuthContextValue = AuthState & {
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
