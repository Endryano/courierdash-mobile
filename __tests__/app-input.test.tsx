import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppInput } from '@/components/ui/AppInput';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { darkTheme } from '@/theme/theme';

function renderInput(variant: 'default' | 'filled') {
  return render(<ThemeProvider><AppInput autoComplete="current-password" label="Password" secureTextEntry testID="input" value="secret" variant={variant} /></ThemeProvider>);
}

describe('AppInput', () => {
  test('keeps the default variant transparent and forwards native credential props', async () => {
    await renderInput('default');
    const input = screen.getByTestId('input');
    expect(StyleSheet.flatten(input.props.style)).toMatchObject({ backgroundColor: 'transparent' });
    expect(input.props.autoComplete).toBe('current-password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  test('uses the filled variant only when explicitly requested', async () => {
    const view = await renderInput('filled');
    expect(StyleSheet.flatten(screen.getByTestId('input').props.style)).toMatchObject({ backgroundColor: darkTheme.colors.surfaceElevated });
    await view.rerender(<ThemeProvider><AppInput error="Invalid" label="Password" testID="input" value="" variant="filled" /></ThemeProvider>);
    expect(screen.getByText('Invalid')).toBeTruthy();
  });
});
