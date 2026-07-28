import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type ScreenProps = ViewProps & {
  edges?: readonly Edge[];
};

export function Screen({ edges, style, ...props }: ScreenProps) {
  const { colors } = useTheme();

  return <SafeAreaView {...props} edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]} />;
}
