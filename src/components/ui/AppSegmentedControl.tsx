import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

export type AppSegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  testID?: string;
  disabled?: boolean;
  breakBefore?: boolean;
};

type AppSegmentedControlProps<T extends string> = {
  value: T;
  options: readonly AppSegmentedControlOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  testID?: string;
  appearance?: 'default' | 'filter';
};

export function AppSegmentedControl<T extends string>({ accessibilityLabel, appearance = 'default', onChange, options, testID, value }: AppSegmentedControlProps<T>) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="tablist" style={[styles.control, { gap: spacing.xs }]} testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        const disabled = option.disabled === true;

        return [
          option.breakBefore ? <View key={`${option.value}-break`} style={styles.breakBefore} /> : null,
          <Pressable
              accessibilityRole="tab"
              accessibilityState={disabled ? { selected, disabled: true } : { selected }}
            disabled={disabled || undefined}
            key={option.value}
            onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                appearance === 'filter' ? styles.filterOption : undefined,
                {
                  backgroundColor: appearance === 'filter' ? colors.surfaceElevated : selected ? colors.accent : colors.surface,
                  borderColor: appearance === 'filter' && selected ? colors.accent : colors.border,
                  borderRadius: radii.md,
                  opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                },
              ]}
              testID={option.testID}
            >
              <AppText muted={!selected} style={[appearance === 'filter' ? styles.filterLabel : undefined, { color: selected ? appearance === 'filter' ? colors.accent : colors.background : undefined }]} variant="label">
                {option.label}
              </AppText>
            </Pressable>,
        ];
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterOption: { alignItems: 'center', justifyContent: 'center', minHeight: 48, minWidth: 96 },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  breakBefore: { flexBasis: '100%' },
});
