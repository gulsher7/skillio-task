import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { ScoredWord } from '@/models/coach';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useColors } from '@/styles/theme';
import { radius } from '@/styles/tokens';

/** Fraction of a word's slot spent settling, so neighbours overlap slightly. */
const SETTLE = 1.9;

/** How far a word lifts as it lands. */
const DROP = ms(-3);

type Props = {
  /** The line, split into words. */
  text: string[];
  /** Verdicts once they exist; null while the line is still just something to read. */
  scored: ScoredWord[] | null;
  /**
   * How far the resolve has swept, in words. Animating this from 0 to
   * `text.length` walks the settle left to right.
   */
  reveal: SharedValue<number>;
  /** Highlights the word the hint is talking about. */
  focusIndex: number | null;
  onWordPress?: (index: number) => void;
};

/**
 * The line being read, with each word able to settle into its own verdict.
 *
 * Words do not all flip at once: each one reads its own slice of `reveal`, so
 * the result arrives as a sweep rather than a pop. That single detail is most
 * of what makes the scoring feel like something was listened to instead of
 * looked up.
 */
export default function WordLine({ text, scored, reveal, focusIndex, onWordPress }: Props) {
  const styles = useStyles();

  return (
    <View style={styles.line}>
      {text.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          word={word}
          verdict={scored?.[index]?.verdict ?? null}
          index={index}
          reveal={reveal}
          focused={focusIndex === index}
          onPress={onWordPress ? () => onWordPress(index) : undefined}
        />
      ))}
    </View>
  );
}

function Word({
  word,
  verdict,
  index,
  reveal,
  focused,
  onPress,
}: {
  word: string;
  verdict: ScoredWord['verdict'] | null;
  index: number;
  reveal: SharedValue<number>;
  focused: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();

  const target =
    verdict === 'good'
      ? colors.mintInk
      : verdict === 'close'
        ? colors.amberInk
        : verdict === 'missed'
          ? colors.berryInk
          : colors.ink;

  const animated = useAnimatedStyle(() => {
    if (!verdict) return { color: colors.ink, transform: [{ translateY: 0 }] };

    const p = interpolate(reveal.get(), [index, index + SETTLE], [0, 1], 'clamp');

    return {
      color: interpolateColor(p, [0, 1], [colors.ink, target]),
      // A small drop as it lands, so the sweep has weight travelling through it.
      transform: [{ translateY: interpolate(p, [0, 0.55, 1], [0, DROP, 0]) }],
    };
  });

  const underline = useAnimatedStyle(() => {
    if (!verdict || verdict === 'good') return { opacity: 0, transform: [{ scaleX: 0 }] };
    const p = interpolate(reveal.get(), [index, index + SETTLE], [0, 1], 'clamp');
    return { opacity: p * (focused ? 1 : 0.5), transform: [{ scaleX: p }] };
  });

  return (
    <View style={styles.wordWrap}>
      <Animated.Text
        style={[styles.word, animated]}
        onPress={onPress}
        suppressHighlighting
        accessibilityRole={onPress ? 'button' : 'text'}
      >
        {word}
      </Animated.Text>
      <Animated.View
        style={[
          styles.underline,
          { backgroundColor: verdict === 'missed' ? colors.berry : colors.amber },
          underline,
        ]}
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    columnGap: ms(7),
    rowGap: ms(4),
  },
  wordWrap: {
    alignItems: 'center',
  },
  word: {
    fontFamily: fontFamily.bold,
    fontSize: ms(25),
    lineHeight: ms(34),
    color: c.ink,
    textAlign: 'center',
  },
  underline: {
    height: ms(3),
    borderRadius: radius.pill,
    alignSelf: 'stretch',
    marginTop: ms(1),
  },
}));
