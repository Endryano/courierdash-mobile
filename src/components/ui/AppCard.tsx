import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export type AppCardVariant = 'default' | 'elevated';
export type AppCardPadding = 'none' | 'sm' | 'md' | 'lg';

type AppCardProps = ViewProps & {
  variant?: AppCardVariant;
  padding?: AppCardPadding;
};

export function AppCard({ children, padding = 'md', style, variant = 'default', ...props }: AppCardProps) {
  const { colors, radii, spacing } = useTheme();
  const paddings = { none: 0, sm: spacing.sm, md: spacing.md, lg: spacing.lg };

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: variant === 'elevated' ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: paddings[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
