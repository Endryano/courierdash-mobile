import { useEffect, useRef, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';

import { AuthMessage } from './AuthMessage';
import { AuthApiError, signUpWithEmail } from './authApi';
import { validateSignupInput, type AuthFieldErrors } from './authValidation';
import { useLocalization } from '@/i18n/LocalizationProvider';

export type SignupFormModel = {
  confirmPassword: string;
  email: string;
  errors: AuthFieldErrors;
  password: string;
  pending: boolean;
  serverError?: string;
  success?: string;
  setConfirmPassword: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: () => Promise<void>;
};

export function useSignupForm(): SignupFormModel {
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

    if (!result.isValid) {
      setErrors(result.fieldErrors);
      return;
    }

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
      if (mounted.current) {
        setServerError(t(error instanceof AuthApiError ? error.key : 'auth.error.generic'));
      }
    } finally {
      if (mounted.current) {
        setPending(false);
      }
    }
  }

  return { confirmPassword, email, errors, password, pending, serverError, setConfirmPassword, setEmail, setPassword, submit, success };
}

export function SignupForm({ form }: { form: SignupFormModel }) {
  const { t } = useLocalization();

  return (
    <>
      <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={form.errors.email ? t(form.errors.email) : undefined} keyboardType="email-address" label={t('auth.email')} onChangeText={form.setEmail} testID="signup-email" value={form.email} variant="filled" />
      <AppInput autoComplete="new-password" error={form.errors.password ? t(form.errors.password) : undefined} label={t('auth.password')} onChangeText={form.setPassword} secureTextEntry testID="signup-password" value={form.password} variant="filled" />
      <AppInput autoComplete="new-password" error={form.errors.confirmPassword ? t(form.errors.confirmPassword) : undefined} label={t('auth.confirmPassword')} onChangeText={form.setConfirmPassword} secureTextEntry testID="signup-confirm-password" value={form.confirmPassword} variant="filled" />
      {form.serverError ? <AuthMessage message={form.serverError} /> : null}
      {form.success ? <AuthMessage message={form.success} role="status" /> : null}
      <AppButton label={form.pending ? t('auth.loading') : t('auth.signup')} loading={form.pending} onPress={() => void form.submit()} testID="signup-submit" />
    </>
  );
}
