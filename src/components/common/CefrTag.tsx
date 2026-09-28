import { StyleSheet } from 'react-native';

import type { Cefr } from '@/models/home';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';

import TextComp from './TextComp';

type Props = {
  level: Cefr;
  /** Filled teal reads as "the one you are heading for". */
  filled?: boolean;
  size?: number;
};

export default function CefrTag({ level, filled, size = 13 }: Props) {
  return (
    <TextComp style={[styles.tag, { fontSize: ms(size) }, filled ? styles.filled : null]}>
      {level}
    </TextComp>
  );
}

const styles = StyleSheet.create({
  tag: {
    fontFamily: fontFamily.display,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(8),
    overflow: 'hidden',
    backgroundColor: colors.teal50,
    color: colors.teal700,
    letterSpacing: 0.2,
  },
  filled: {
    backgroundColor: colors.teal,
    color: colors.surface,
  },
});
