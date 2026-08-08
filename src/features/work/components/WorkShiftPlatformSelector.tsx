import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type WorkShiftPlatformSelectorProps<TPlatform extends string> = {
  platforms: readonly TPlatform[];
  selected: ReadonlySet<TPlatform>;
  getLabel: (platform: TPlatform) => string;
  onToggle: (platform: TPlatform) => void;
  disabled?: boolean;
  getTestID?: (platform: TPlatform) => string;
  testID?: string;
};

export function WorkShiftPlatformSelector<TPlatform extends string>({ disabled = false, getLabel, getTestID, onToggle, platforms, selected, testID }: WorkShiftPlatformSelectorProps<TPlatform>) {
  const { colors, radii, spacing } = useTheme();

  return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }} testID={testID}>
      {platforms.map((platform) => {
        const isSelected = selected.has(platform);
        return (
          <Pressable
            accessibilityLabel={getLabel(platform)}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: isSelected }}
            disabled={disabled}
            key={platform}
            onPress={() => onToggle(platform)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: isSelected ? '#17343A' : colors.surface,
                borderColor: isSelected ? colors.accent : colors.border,
                borderRadius: radii.full,
                opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                paddingHorizontal: spacing.sm,
              },
            ]}
            testID={getTestID?.(platform)}
          >
            <AppText style={{ color: isSelected ? colors.accent : colors.textPrimary, fontSize: 14, fontWeight: isSelected ? '700' : '600' }} variant="label">
              {isSelected ? `✓ ${getLabel(platform)}` : `+ ${getLabel(platform)}`}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 42,
  },
});
