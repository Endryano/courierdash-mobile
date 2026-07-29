import { useContext } from 'react';

import { ProfileContext, type ProfileContextValue } from './profileContext';

export function useProfile(): ProfileContextValue {
  const profile = useContext(ProfileContext);

  if (profile === null) {
    throw new Error('useProfile must be used within ProfileProvider');
  }

  return profile;
}
