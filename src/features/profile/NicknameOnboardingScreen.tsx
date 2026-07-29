import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/useAuth';
import { useLocalization } from '@/i18n/LocalizationProvider';
import { useTheme } from '@/theme/ThemeProvider';

import { mapNicknameError } from './nicknameError';
import { saveOwnNickname } from './nicknameApi';
import { validateNickname, type NicknameValidationError } from './nicknameValidation';
import { useProfile } from './useProfile';

const validationKey: Record<NicknameValidationError, 'profile.nickname.error.required' | 'profile.nickname.error.tooShort' | 'profile.nickname.error.tooLong' | 'profile.nickname.error.invalidCharacters'> = {
  required: 'profile.nickname.error.required',
  too_short: 'profile.nickname.error.tooShort',
  too_long: 'profile.nickname.error.tooLong',
  invalid_characters: 'profile.nickname.error.invalidCharacters',
};

export function NicknameOnboardingScreen() {
  const { user } = useAuth();
  const { retry } = useProfile();
  const { t } = useLocalization();
  const { spacing } = useTheme();
  const [nickname, setNickname] = useState('');
  const [validationError, setValidationError] = useState<NicknameValidationError>();
  const [serverError, setServerError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  async function save() {
    if (isSaving || user === null) return;

    const result = validateNickname(nickname);
    if (!result.isValid) {
      setValidationError(result.error);
      return;
    }

    setValidationError(undefined);
    setServerError(undefined);
    setIsSaving(true);

    try {
      await saveOwnNickname(user.id, result.value);
      await retry();
    } catch (error) {
      if (isMounted.current) {
        setServerError(t(mapNicknameError(error)));
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: spacing.md }}>
            <AppText variant="title">{t('profile.nickname.title')}</AppText>
            <AppText muted>{t('profile.nickname.description')}</AppText>
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              error={validationError ? t(validationKey[validationError]) : undefined}
              label={t('profile.nickname.label')}
              onChangeText={setNickname}
              onSubmitEditing={() => void save()}
              returnKeyType="done"
              testID="nickname-input"
              value={nickname}
            />
            {serverError ? <AppText accessibilityRole="alert">{serverError}</AppText> : null}
            <AppButton
              disabled={isSaving}
              label={isSaving ? t('profile.nickname.saving') : t('profile.nickname.save')}
              onPress={() => void save()}
              testID="nickname-save"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
