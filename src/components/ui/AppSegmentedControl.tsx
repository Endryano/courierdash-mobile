import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

const filterActiveBackground = '#17343A';

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
  appearance?: 'default' | 'filter' | 'filterWhiteText' | 'dashboard';
};

export function AppSegmentedControl<T extends string>({ accessibilityLabel, appearance = 'default', onChange, options, testID, value }: AppSegmentedControlProps<T>) {
  const { colors, radii, spacing } = useTheme();
  const isFilter = appearance === 'filter' || appearance === 'filterWhiteText';
  const isDashboard = appearance === 'dashboard';
  const usesWhiteFilterText = appearance === 'filterWhiteText';

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="tablist" style={[styles.control, isDashboard ? [styles.dashboardControl, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radii.md }] : { gap: spacing.xs }]} testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        const disabled = option.disabled === true;

        return [
          option.breakBefore && !isDashboard ? <View key={`${option.value}-break`} style={styles.breakBefore} /> : null,
          <Pressable
              accessibilityRole="tab"
              accessibilityState={disabled ? { selected, disabled: true } : { selected }}
            disabled={disabled || undefined}
            key={option.value}
            onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                isFilter ? styles.filterOption : undefined,
                isDashboard ? styles.dashboardOption : undefined,
                {
                  backgroundColor: isDashboard ? selected ? filterActiveBackground : 'transparent' : isFilter ? selected ? filterActiveBackground : colors.surface : selected ? colors.accent : colors.surface,
                  borderColor: isDashboard ? selected ? colors.accent : 'transparent' : isFilter && selected ? colors.accent : colors.border,
                  borderRadius: radii.md,
                  opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: isDashboard ? spacing.xxs : spacing.sm,
                  paddingVertical: isDashboard ? spacing.xs : spacing.xs,
                },
              ]}
              testID={option.testID}
            >
              <AppText muted={!selected && !usesWhiteFilterText && !isDashboard} style={[isFilter ? selected ? styles.filterActiveLabel : styles.filterLabel : undefined, isDashboard ? styles.dashboardLabel : undefined, { color: usesWhiteFilterText ? colors.textPrimary : selected ? isFilter || isDashboard ? colors.accent : colors.background : isDashboard ? colors.textSecondary : undefined }]} variant="label">
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
  dashboardControl: { borderWidth: StyleSheet.hairlineWidth, flexWrap: 'nowrap', gap: 0, overflow: 'hidden', padding: 3 },
  dashboardLabel: { fontSize: 11, fontWeight: '600', lineHeight: 14, textAlign: 'center' },
  dashboardOption: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 40, minWidth: 0 },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterOption: { alignItems: 'center', justifyContent: 'center', minHeight: 48, minWidth: 96 },
  filterLabel: { fontSize: 13, fontWeight: '500' },
  filterActiveLabel: { fontSize: 13, fontWeight: '600' },
  breakBefore: { flexBasis: '100%' },
});
