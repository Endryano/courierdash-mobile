import { useContext } from 'react';

import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);

  if (auth === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return auth;
}
