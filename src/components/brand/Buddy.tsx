import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { ms } from '@/styles/scaling';

const AnimatedG = Animated.createAnimatedComponent(G);

export type BuddyMood = 'happy' | 'cheer';

type Props = {
  size?: number;
  mood?: BuddyMood;
  /** Idle bob. Off for the small inline versions. */
  float?: boolean;
  id?: string;
};

const BLINK_CYCLE = 4500;

/**
 * Buddy: Skillio's mascot. A speech bubble, because the whole product is about
 * getting a sentence out. Blinks on its own and bobs while it waits for you.
 */
export default function Buddy({ size = 180, mood = 'happy', float = true, id = 'buddy' }: Props) {
  const box = ms(size);
  const cheering = mood === 'cheer';

  const blink = useSharedValue(1);
  const bob = useSharedValue(0);

  useEffect(() => {
    blink.set(
      withRepeat(
        withSequence(
          withDelay(BLINK_CYCLE - 200, withTiming(1, { duration: 0 })),
          withTiming(0.08, { duration: 80, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [blink]);

  useEffect(() => {
    if (!float) return;
    bob.set(
      withRepeat(
        withSequence(
          withTiming(-ms(8), { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [bob, float]);

  const eyes = useAnimatedProps(() => ({ scaleY: blink.get() }));
  const drift = useAnimatedStyle(() => ({ transform: [{ translateY: bob.get() }] }));

  return (
    <Animated.View style={float ? drift : undefined} accessible={false}>
      <Svg width={box} height={box} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id={`${id}-body`} x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#2CD0DD" />
            <Stop offset="1" stopColor="#0795A4" />
          </LinearGradient>
          <RadialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#0C2A33" stopOpacity="0.22" />
            <Stop offset="1" stopColor="#0C2A33" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Ellipse cx="60" cy="114" rx="36" ry="5" fill={`url(#${id}-shadow)`} />

        {cheering ? (
          <G stroke="#0795A4" strokeWidth={7} strokeLinecap="round">
            <Path d="M14 58 4 40" />
            <Path d="M106 58l10-18" />
          </G>
        ) : null}

        <Path
          d="M26 18h68a18 18 0 0 1 18 18v36a18 18 0 0 1-18 18H56l-19 16V90H26A18 18 0 0 1 8 72V36a18 18 0 0 1 18-18z"
          fill={`url(#${id}-body)`}
        />
        <Path
          d="M22 30c3-6 9-8 16-8"
          stroke="#FFFFFF"
          strokeOpacity={0.45}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />

        <AnimatedG animatedProps={eyes} originY={52}>
          <Ellipse cx="45" cy="52" rx="8" ry="10" fill="#FFFFFF" />
          <Ellipse cx="75" cy="52" rx="8" ry="10" fill="#FFFFFF" />
          <Circle cx="46.5" cy="54" r="4.6" fill="#0C2A33" />
          <Circle cx="76.5" cy="54" r="4.6" fill="#0C2A33" />
          <Circle cx="48" cy="52" r="1.6" fill="#FFFFFF" />
          <Circle cx="78" cy="52" r="1.6" fill="#FFFFFF" />
        </AnimatedG>

        <Circle cx="34" cy="68" r="5" fill="#FF9DB5" opacity={0.85} />
        <Circle cx="86" cy="68" r="5" fill="#FF9DB5" opacity={0.85} />

        {cheering ? (
          <G>
            <Path d="M49 67h22c0 9-5 14-11 14s-11-5-11-14z" fill="#0C2A33" />
            <Path d="M54 77c3-3 9-3 12 0-2 3-10 3-12 0z" fill="#FF7A8E" />
          </G>
        ) : (
          <Path
            d="M51 69q9 8 18 0"
            stroke="#0C2A33"
            strokeWidth={3.6}
            strokeLinecap="round"
            fill="none"
          />
        )}

        <Path d="M99 3l2.6 6.4L108 12l-6.4 2.6L99 21l-2.6-6.4L90 12l6.4-2.6z" fill="#FFC23D" />
      </Svg>
    </Animated.View>
  );
}
