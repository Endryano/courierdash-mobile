import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type MoreAccountCardProps = {
  label: string;
  nickname: string;
  email?: string;
};

export function MoreAccountCard({ email, label, nickname }: MoreAccountCardProps) {
  const { spacing } = useTheme();
  const normalizedNickname = nickname.trim();
  const normalizedEmail = email?.trim();

  if (normalizedNickname.length === 0) return null;

  return (
    <AppCard>
      <View style={{ gap: spacing.xs }}>
        <AppText muted variant="caption">{label}</AppText>
        <AppText style={styles.identity}>{normalizedNickname}</AppText>
        {normalizedEmail ? <AppText muted style={styles.identity} variant="caption">{normalizedEmail}</AppText> : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignSelf: 'stretch',
    flexShrink: 1,
  },
});
