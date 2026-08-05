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
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} testID={testID}>
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
                backgroundColor: isSelected ? '#18374c' : '#243247',
                borderColor: isSelected ? '#00b7ef' : '#465977',
                borderRadius: 16,
                opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                paddingHorizontal: spacing.md,
              },
            ]}
            testID={getTestID?.(platform)}
          >
            <AppText style={{ color: colors.textPrimary, fontSize: 17, fontWeight: isSelected ? '800' : '600' }} variant="label">
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
    minHeight: 48,
  },
});
