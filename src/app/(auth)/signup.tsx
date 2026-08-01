import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AuthMessage } from '@/features/auth/AuthMessage';
import { AuthShell } from '@/features/auth/AuthShell';
import { AuthApiError, signUpWithEmail } from '@/features/auth/authApi';
import { validateSignupInput, type AuthFieldErrors } from '@/features/auth/authValidation';
import { useLocalization } from '@/i18n/LocalizationProvider';

export default function SignupScreen() {
  const { t } = useLocalization();
  const mounted = useRef(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [serverError, setServerError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => () => { mounted.current = false; }, []);

  async function submit() {
    if (pending) return;
    const result = validateSignupInput({ email, password, confirmPassword });
    if (!result.isValid) { setErrors(result.fieldErrors); return; }
    setErrors({});
    setServerError(undefined);
    setSuccess(undefined);
    setPending(true);
    try {
      const session = await signUpWithEmail({ email: result.value.email, password: result.value.password });
      if (mounted.current) {
        setPassword('');
        setConfirmPassword('');
        setSuccess(t(session ? 'auth.signedUp' : 'auth.confirmEmail'));
      }
    } catch (error) {
      if (mounted.current) setServerError(t(error instanceof AuthApiError ? error.key : 'auth.error.generic'));
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  return (
    <AuthShell activeMode="signup" brand={t('auth.brand')} loginLabel={t('auth.login')} onModeChange={(mode) => { if (mode === 'login') router.push('/login'); }} signupLabel={t('auth.signup')} title={t('auth.signupTitle')}>
      <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={errors.email ? t(errors.email) : undefined} keyboardType="email-address" label={t('auth.email')} onChangeText={setEmail} testID="signup-email" value={email} variant="filled" />
      <AppInput autoComplete="new-password" error={errors.password ? t(errors.password) : undefined} label={t('auth.password')} onChangeText={setPassword} secureTextEntry testID="signup-password" value={password} variant="filled" />
      <AppInput autoComplete="new-password" error={errors.confirmPassword ? t(errors.confirmPassword) : undefined} label={t('auth.confirmPassword')} onChangeText={setConfirmPassword} secureTextEntry testID="signup-confirm-password" value={confirmPassword} variant="filled" />
      {serverError ? <AuthMessage message={serverError} /> : null}
      {success ? <AuthMessage message={success} role="status" /> : null}
      <AppButton label={pending ? t('auth.loading') : t('auth.signup')} loading={pending} onPress={() => void submit()} testID="signup-submit" />
    </AuthShell>
  );
}
