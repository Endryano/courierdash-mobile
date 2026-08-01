import { useState } from 'react';

import { LoginForm, useLoginForm } from './LoginForm';
import { AuthShell, type AuthMode } from './AuthShell';
import { SignupForm, useSignupForm } from './SignupForm';
import { useLocalization } from '@/i18n/LocalizationProvider';

export function AuthScreen({ initialMode }: { initialMode: AuthMode }) {
  const { t } = useLocalization();
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode);
  const loginForm = useLoginForm();
  const signupForm = useSignupForm();

  return (
    <AuthShell activeMode={activeMode} brand={t('auth.brand')} loginLabel={t('auth.login')} onModeChange={setActiveMode} signupLabel={t('auth.signup')} title={t(activeMode === 'login' ? 'auth.loginTitle' : 'auth.signupTitle')}>
      {activeMode === 'login' ? <LoginForm form={loginForm} /> : <SignupForm form={signupForm} />}
    </AuthShell>
  );
}
