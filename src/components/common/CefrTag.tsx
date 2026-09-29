import type { Cefr } from '@/models/home';
import { makeStyles } from '@/styles/theme';

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
  const styles = useStyles();
  return (
    <TextComp
      style={[
        styles.tag,
        { fontSize: ms(size), lineHeight: ms(size * 1.28) },
        filled ? styles.filled : null,
      ]}
    >
      {level}
    </TextComp>
  );
}

const useStyles = makeStyles((c) => ({
  tag: {
    fontFamily: fontFamily.display,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(8),
    overflow: 'hidden',
    backgroundColor: c.teal50,
    color: c.teal700,
    letterSpacing: 0.2,
  },
  filled: {
    backgroundColor: c.teal,
    color: c.surface,
  },
}));
