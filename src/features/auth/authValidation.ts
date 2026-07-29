export type AuthFieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword', 'auth.required' | 'auth.invalidEmail' | 'auth.passwordMismatch'>>;

export type SignInInput = { email: string; password: string };
export type SignUpInput = SignInInput & { confirmPassword: string };

export type AuthValidationResult<T> =
  | { isValid: true; value: T; fieldErrors: AuthFieldErrors }
  | { isValid: false; fieldErrors: AuthFieldErrors };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(input: SignInInput): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = input.email.trim();
  if (!email) errors.email = 'auth.required';
  else if (!emailPattern.test(email)) errors.email = 'auth.invalidEmail';
  if (!input.password) errors.password = 'auth.required';
  return errors;
}

export function validateLoginInput(input: SignInInput): AuthValidationResult<SignInInput> {
  const fieldErrors = validateCredentials(input);
  return Object.keys(fieldErrors).length ? { isValid: false, fieldErrors } : { isValid: true, fieldErrors, value: { email: input.email.trim(), password: input.password } };
}

export function validateSignupInput(input: SignUpInput): AuthValidationResult<SignUpInput> {
  const fieldErrors = validateCredentials(input);
  if (!input.confirmPassword) fieldErrors.confirmPassword = 'auth.required';
  else if (input.password !== input.confirmPassword) fieldErrors.confirmPassword = 'auth.passwordMismatch';
  return Object.keys(fieldErrors).length ? { isValid: false, fieldErrors } : { isValid: true, fieldErrors, value: { email: input.email.trim(), password: input.password, confirmPassword: input.confirmPassword } };
}
