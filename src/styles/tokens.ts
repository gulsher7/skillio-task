import { Platform } from 'react-native';

import { colors } from './colors';
import { ms } from './scaling';

export const spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  base: ms(14),
  lg: ms(16),
  xl: ms(20),
  xxl: ms(24),
  gutter: ms(20),
  /** Home breathes a little wider than the onboarding screens. */
  homeGutter: ms(16),
  card: ms(18),
  section: ms(14),
} as const;

export const radius = {
  chip: ms(10),
  sm: ms(12),
  md: ms(14),
  input: ms(16),
  button: ms(18),
  option: ms(20),
  card: ms(26),
  hero: ms(30),
  sheet: ms(30),
  pill: 999,
} as const;

type Shadow = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

const shadow = (color: string, opacity: number, r: number, y: number, e: number): Shadow => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: r,
  shadowOffset: { width: 0, height: y },
  elevation: e,
});

/** Shadows are tinted with the thing that casts them, never plain black. */
export const shadows = {
  primary: shadow(colors.teal, 0.45, 12, 8, 6),
  hero: shadow('#056E79', 0.35, 18, 12, 8),
  heroDone: shadow(colors.ink, 0.35, 18, 12, 8),
  white: shadow('#03323A', 0.22, 10, 6, 4),
  mint: shadow(colors.mint, 0.4, 12, 8, 6),
  berry: shadow(colors.berry, 0.4, 12, 8, 6),
  sheet: shadow(colors.ink, 0.25, 24, -6, 20),
  toast: shadow('#000000', 0.35, 14, 8, 12),
  tabBar: shadow(colors.ink, 0.18, 18, 8, 10),
  none: shadow('transparent', 0, 0, 0, 0),
} as const;

export const hairline = Platform.select({ ios: 0.5, default: 1 });

export const layout = {
  buttonHeight: ms(56),
  buttonHeightSm: ms(48),
  buttonHeightXs: ms(44),
  tabBarHeight: ms(66),
  headerAvatar: ms(46),
  /** Keeps the floating tab bar from covering the last card. */
  scrollBottomPad: ms(120),
} as const;
