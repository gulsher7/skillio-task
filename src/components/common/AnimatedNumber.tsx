import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

import { useCountUp } from '@/hooks/useCountUp';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function group(n: number) {
  'worklet';
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return out;
}

type Props = {
  value: number;
  from?: number;
  delay?: number;
  duration?: number;
  run?: boolean;
  prefix?: string;
  suffix?: string;
  /** 1,240 instead of 1240 */
  grouped?: boolean;
  style?: StyleProp<TextStyle>;
};

/**
 * A number that ticks up. Rendered into a read-only TextInput because that is
 * the only text node Reanimated can drive without a JS round trip per frame.
 */
export default function AnimatedNumber({
  value,
  from = 0,
  delay = 0,
  duration,
  run = true,
  prefix = '',
  suffix = '',
  grouped,
  style,
}: Props) {
  const count = useCountUp(value, { from, delay, duration, run });

  const animatedProps = useAnimatedProps(() => {
    const rounded = Math.round(count.get());
    return { text: `${prefix}${grouped ? group(rounded) : rounded}${suffix}` } as never;
  });

  return (
    <AnimatedTextInput
      editable={false}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      underlineColorAndroid="transparent"
      defaultValue={`${prefix}${grouped ? group(from) : from}${suffix}`}
      animatedProps={animatedProps}
      style={[styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 0,
    margin: 0,
    fontFamily: fontFamily.display,
    fontSize: ms(20),
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
