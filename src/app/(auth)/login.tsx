import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AuthMessage } from '@/features/auth/AuthMessage';
import { AuthShell } from '@/features/auth/AuthShell';
import { AuthApiError, signInWithEmail } from '@/features/auth/authApi';
import { validateLoginInput, type AuthFieldErrors } from '@/features/auth/authValidation';
import { useLocalization } from '@/i18n/LocalizationProvider';

export default function LoginScreen() {
  const { t } = useLocalization();
  const mounted = useRef(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [serverError, setServerError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => () => { mounted.current = false; }, []);

  async function submit() {
    if (pending) return;
    const result = validateLoginInput({ email, password });
    if (!result.isValid) { setErrors(result.fieldErrors); return; }
    setErrors({});
    setServerError(undefined);
    setPending(true);
    try {
      await signInWithEmail(result.value);
      if (mounted.current) setPassword('');
    } catch (error) {
      if (mounted.current) setServerError(t(error instanceof AuthApiError ? error.key : 'auth.error.generic'));
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  return (
    <AuthShell activeMode="login" brand={t('auth.brand')} loginLabel={t('auth.login')} onModeChange={(mode) => { if (mode === 'signup') router.push('/signup'); }} signupLabel={t('auth.signup')} title={t('auth.loginTitle')}>
      <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={errors.email ? t(errors.email) : undefined} keyboardType="email-address" label={t('auth.email')} onChangeText={setEmail} testID="login-email" value={email} variant="filled" />
      <AppInput autoComplete="current-password" error={errors.password ? t(errors.password) : undefined} label={t('auth.password')} onChangeText={setPassword} secureTextEntry testID="login-password" value={password} variant="filled" />
      {serverError ? <AuthMessage message={serverError} /> : null}
      <AppButton label={pending ? t('auth.loading') : t('auth.login')} loading={pending} onPress={() => void submit()} testID="login-submit" />
    </AuthShell>
  );
}
