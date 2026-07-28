import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type AppTextVariant = 'title' | 'body' | 'label' | 'caption';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      {...props}
      style={[
        typography[variant],
        { color: muted ? colors.textSecondary : colors.textPrimary },
        style,
      ]}
    />
  );
}
