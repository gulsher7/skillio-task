import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';

export type TextVariant =
  'h1' | 'h2' | 'title' | 'body' | 'small' | 'tiny' | 'eyebrow' | 'button' | 'num';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
  /** Stacks on top of the variant, for the odd one-off weight. */
  font?: keyof typeof fontFamily;
  center?: boolean;
};

export default function TextComp({ variant = 'body', color, font, center, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles[variant],
        color ? { color } : null,
        font ? { fontFamily: fontFamily[font] } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
    />
  );
}

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  h1: {
    fontFamily: fontFamily.display,
    fontSize: ms(30),
    lineHeight: ms(33),
    letterSpacing: -0.6,
    color: colors.ink,
  },
  h2: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(20),
    lineHeight: ms(23),
    letterSpacing: -0.3,
    color: colors.ink,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(18),
    lineHeight: ms(21),
    letterSpacing: -0.2,
    color: colors.ink,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: ms(15.5),
    lineHeight: ms(22),
    color: colors.ink2,
  },
  small: {
    fontFamily: fontFamily.medium,
    fontSize: ms(13.5),
    lineHeight: ms(18),
    color: colors.ink2,
  },
  tiny: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(12.5),
    lineHeight: ms(16),
    color: colors.ink3,
  },
  eyebrow: {
    fontFamily: fontFamily.black,
    fontSize: ms(11.5),
    lineHeight: ms(14),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink3,
  },
  button: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.surface,
  },
  num: {
    fontFamily: fontFamily.display,
    fontSize: ms(20),
    letterSpacing: -0.4,
    color: colors.ink,
    ...tabular,
  },
});
