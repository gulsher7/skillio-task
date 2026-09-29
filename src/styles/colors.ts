import { lightPalette } from './palette';

export type { HueName, Palette } from './palette';

/**
 * The light palette, for the few places that resolve colours outside React —
 * shadow tints and the like. Anything rendered should read the active palette
 * through `useColors()` or `makeStyles()` instead.
 */
export const colors = lightPalette;

/** Brand gradients read the same in both themes, so they are not themed. */
export const gradients = {
  primaryButton: ['#12B3C2', '#08A4B3', '#0799A7'],
  /** practice hero, not done yet */
  questCard: ['#12B7C6', '#08A4B3', '#067D89'],
  /** practice hero, done for today */
  questDone: ['#123A45', '#0C2A33', '#0A2229'],
  celebrate: ['#17BCCB', '#07808D'],
  journey: ['#08A4B3', '#23B37F'],
  xpBar: ['#FFD36A', '#FFB21E'],
  streakDay: ['#FFA25E', '#FF7A45'],
  planHeader: ['#0AAFBE', '#067F8C'],
  noPlanCard: ['#123A45', '#0C2A33'],
  tierChip: ['#FFE3A1', '#FFC23D'],
  logo: ['#1FC6D4', '#068C99'],
  buddy: ['#2CD0DD', '#0795A4'],
} as const;

export type SkillKey = keyof typeof lightPalette.skill;
