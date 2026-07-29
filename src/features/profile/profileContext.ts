import { createContext } from 'react';

import type { ProfileBootstrapState } from './profileTypes';

export type ProfileContextValue = ProfileBootstrapState & {
  retry: () => Promise<void>;
  subjectUserId: string | null;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);
