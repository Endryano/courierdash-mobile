import { Children, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type WorkFormFieldPairProps = {
  children: ReactNode;
  testID?: string;
};

/** Keeps paired Work fields side by side on regular phone widths. */
export function WorkFormFieldPair({ children, testID }: WorkFormFieldPairProps) {
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const shouldStack = width < 360;

  return (
    <View style={[styles.row, { gap: spacing.sm }, shouldStack && styles.stacked]} testID={testID}>
      {Children.map(children, (child) => <View style={styles.item}>{child}</View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  stacked: { flexDirection: 'column' },
  item: { flex: 1, minWidth: 0 },
});
