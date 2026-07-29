import { useContext } from 'react';

import { AuthContext } from './authContext';
import type { AuthState } from './authTypes';

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);

  if (auth === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return auth;
}
