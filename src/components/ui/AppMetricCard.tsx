import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppCard } from './AppCard';
import { AppText } from './AppText';

type AppMetricCardProps = {
  label: string;
  value: string;
  accessibilityLabel?: string;
  children?: ReactNode;
  testID?: string;
};

export function AppMetricCard({ accessibilityLabel, children, label, testID, value }: AppMetricCardProps) {
  const { spacing } = useTheme();

  return (
    <AppCard
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
      style={[styles.card, { gap: spacing.xxs }]}
      testID={testID}
    >
      <AppText muted variant="label">{label}</AppText>
      <AppText variant="body">{value}</AppText>
      {children}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    minHeight: 76,
  },
});
