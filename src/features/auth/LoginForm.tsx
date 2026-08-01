import { useEffect, useRef, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';

import { AuthMessage } from './AuthMessage';
import { AuthApiError, signInWithEmail } from './authApi';
import { validateLoginInput, type AuthFieldErrors } from './authValidation';
import { useLocalization } from '@/i18n/LocalizationProvider';

export type LoginFormModel = {
  email: string;
  errors: AuthFieldErrors;
  password: string;
  pending: boolean;
  serverError?: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: () => Promise<void>;
};

export function useLoginForm(): LoginFormModel {
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

    if (!result.isValid) {
      setErrors(result.fieldErrors);
      return;
    }

    setErrors({});
    setServerError(undefined);
    setPending(true);

    try {
      await signInWithEmail(result.value);

      if (mounted.current) {
        setPassword('');
      }
    } catch (error) {
      if (mounted.current) {
        setServerError(t(error instanceof AuthApiError ? error.key : 'auth.error.generic'));
      }
    } finally {
      if (mounted.current) {
        setPending(false);
      }
    }
  }

  return { email, errors, password, pending, serverError, setEmail, setPassword, submit };
}

export function LoginForm({ form }: { form: LoginFormModel }) {
  const { t } = useLocalization();

  return (
    <>
      <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={form.errors.email ? t(form.errors.email) : undefined} keyboardType="email-address" label={t('auth.email')} onChangeText={form.setEmail} testID="login-email" value={form.email} variant="filled" />
      <AppInput autoComplete="current-password" error={form.errors.password ? t(form.errors.password) : undefined} label={t('auth.password')} onChangeText={form.setPassword} secureTextEntry testID="login-password" value={form.password} variant="filled" />
      {form.serverError ? <AuthMessage message={form.serverError} /> : null}
      <AppButton label={form.pending ? t('auth.loading') : t('auth.login')} loading={form.pending} onPress={() => void form.submit()} testID="login-submit" />
    </>
  );
}
