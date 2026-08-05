export type Theme = typeof darkTheme;

export const darkTheme = {
  colors: {
    background: '#121212',
    surface: '#1e1e24',
    surfaceElevated: '#252530',
    border: '#2c2c38',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    accent: '#00e5ff',
    accentPressed: '#00b8cc',
    positive: '#00b844',
    positivePressed: '#009637',
    warning: '#d88b00',
    warningPressed: '#ae7000',
    disabled: '#5a5a66',
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  typography: {
    title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  },
} as const;
