import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { darkTheme } from '@/theme/theme';

function renderButton(props: React.ComponentProps<typeof AppButton>) {
  return render(<ThemeProvider><AppButton {...props} /></ThemeProvider>);
}

describe('AppButton', () => {
  test('keeps default usage as the current primary button with a 48px touch target', async () => {
    const onPress = jest.fn();
    await renderButton({ label: 'Save', onPress, testID: 'button' });
    const button = screen.getByTestId('button');
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ backgroundColor: darkTheme.colors.accent, minHeight: 48 });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test.each(['secondary', 'ghost', 'danger'] as const)('renders the %s variant distinct from primary', async (variant) => {
    await renderButton({ label: variant, onPress: jest.fn(), testID: 'button', variant });
    const style = StyleSheet.flatten(screen.getByTestId('button').props.style);
    expect(style.backgroundColor).not.toBe(darkTheme.colors.accent);
    expect(style.borderWidth).toBe(StyleSheet.hairlineWidth);
  });

  test('disables and exposes busy state while loading without invoking the action', async () => {
    const onPress = jest.fn();
    await renderButton({ label: 'Save', loading: true, onPress, testID: 'button' });
    const button = screen.getByTestId('button');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('keeps the existing disabled accessibility state and accepts an explicit label', async () => {
    await renderButton({ accessibilityLabel: 'Save shift', disabled: true, label: 'Save', onPress: jest.fn(), testID: 'button' });
    const button = screen.getByTestId('button');
    expect(button.props.accessibilityLabel).toBe('Save shift');
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });
});
