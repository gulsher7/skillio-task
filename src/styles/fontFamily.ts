import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';

/**
 * Bricolage carries headlines and numbers, Figtree carries everything else.
 *
 * Always pair a `fontSize` with an explicit `lineHeight` — Bricolage's default
 * line box is shorter than its ascenders, so without one iOS clips the tops of
 * glyphs and lets them overlap the text above. Roughly 1.28x for Bricolage and
 * 1.3x for Figtree; headline styles can go tighter, single-line numbers cannot.
 */
export const fontFamily = {
  displaySemi: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  display: 'BricolageGrotesque_800ExtraBold',

  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  black: 'Figtree_800ExtraBold',
} as const;

export const fontAssets = {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
};
