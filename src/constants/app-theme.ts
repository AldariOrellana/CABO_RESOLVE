
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const AppColors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F7FB',
    card: '#FFFFFF',
    input: '#EEF2F8',
    text: '#202E43',
    textSecondary: '#687891',
    placeholder: '#94A3B8',
    border: '#DFE5EE',
    primary: '#247AF5',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    secondary: '#E8EDF5',
    onSecondary: '#263247',
    onPrimary: '#FFFFFF',
    disabled: '#CBD5E1',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    background: '#111827',
    surface: '#172235',
    card: '#1B2636',
    input: '#253247',
    text: '#F1F5F9',
    textSecondary: '#A8B8D0',
    placeholder: '#94A3B8',
    border: '#364257',
    primary: '#3987FF',
    success: '#22C55E',
    danger: '#F87171',
    warning: '#F59E0B',
    secondary: '#334155',
    onSecondary: '#F1F5F9',
    onPrimary: '#FFFFFF',
    disabled: '#475569',
    overlay: 'rgba(0,0,0,0.65)',
  },
} as const;

export type AppThemeColors = {
  [K in keyof typeof AppColors.light]: string;
};
