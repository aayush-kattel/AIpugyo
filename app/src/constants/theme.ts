import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1f1b17',
    background: '#fff8f4',
    backgroundElement: '#fbf2eb',
    backgroundSelected: '#ffdbca',
    textSecondary: '#584237',
  },
  dark: {
    text: '#1f1b17',
    background: '#fff8f4',
    backgroundElement: '#fbf2eb',
    backgroundSelected: '#ffdbca',
    textSecondary: '#584237',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// AI Pugyo brand colors
export const Brand = {
  primary:    '#f97316',
  primaryDark:'#9d4300',
  bg:         '#fff8f4',
  bgSection:  '#fbf2eb',
  text:       '#1f1b17',
  textMuted:  '#584237',
  textLight:  '#8c7164',
  border:     '#e0d9cc',
  white:      '#ffffff',
  danger:     '#ba1a1a',
  dangerBg:   '#ffdad6',
  success:    '#15803d',
  card:       '#ffffff',
  badge:      '#ffdbca',
  badgeText:  '#341100',
};

export const Fonts = Platform.select({
  ios:     { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal',    serif: 'serif',    rounded: 'normal',     mono: 'monospace'   },
  web:     { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

export const Spacing = {
  half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;