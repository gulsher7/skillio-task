import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import Buddy from '@/components/brand/Buddy';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import { DEFAULTS } from '@/data/mock';
import { useAppSelector } from '@/hooks/useRedux';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { spacing } from '@/styles/tokens';

const STEPS = [
  'Understanding your goals',
  'Setting your English level',
  'Creating your daily goal',
  'Preparing your lessons',
];

const STEP_AT = [900, 1800, 2700, 4100];
const HANDOFF = 5000;

const RING = ms(180);

export default function BuildingScreen() {
  const name = useAppSelector((s) => s.onboarding.name.trim() || DEFAULTS.userName);
  const reduced = useReducedMotion();
  const [done, setDone] = useState(0);

  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    const speed = reduced ? 0.25 : 1;
    const timers = STEP_AT.map((at, i) => setTimeout(() => setDone(i + 1), at * speed));
    timers.push(setTimeout(() => router.replace('/home'), HANDOFF * speed));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    spin.set(withRepeat(withTiming(360, { duration: 2400, easing: Easing.linear }), -1, false));
    pulse.set(
      withRepeat(withTiming(1.25, { duration: 500, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [spin, pulse, reduced]);

  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));
  const dot = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));

  const complete = done === STEPS.length;
  const percent = complete ? 100 : done * 24 + 4;

  return (
    <View style={styles.root}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.ring, ring]}>
          <Svg width={RING} height={RING} viewBox="0 0 180 180">
            <Circle cx="90" cy="90" r="84" fill="none" stroke={colors.teal100} strokeWidth={4} />
            <Circle
              cx="90"
              cy="90"
              r="84"
              fill="none"
              stroke={colors.teal}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="90 440"
            />
          </Svg>
        </Animated.View>
        <Buddy size={116} mood={complete ? 'cheer' : 'happy'} id="building" />
      </View>

      <View style={styles.copy}>
        <TextComp variant="h1" center style={styles.title}>
          {complete ? `You're all set, ${name}!` : `Building your learning path, ${name}`}
        </TextComp>
        <AnimatedNumber value={percent} suffix="%" duration={700} style={styles.percent} />
      </View>

      <View style={styles.steps} accessibilityLiveRegion="polite">
        {STEPS.map((step, i) => {
          const finished = i < done;
          const active = i === done;
          return (
            <View key={step} style={styles.step}>
              <View
                style={[
                  styles.stepDot,
                  finished ? styles.stepDotDone : null,
                  active ? styles.stepDotActive : null,
                ]}
              >
                {finished ? (
                  <Icon name="check" size={15} color={colors.surface} strokeWidth={3.4} />
                ) : null}
                {active ? <Animated.View style={[styles.pulse, dot]} /> : null}
              </View>
              <TextComp style={[styles.stepLabel, finished || active ? styles.stepLabelOn : null]}>
                {step}
              </TextComp>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(28),
    gap: ms(26),
    backgroundColor: colors.bg,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFill,
  },
  copy: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  title: {
    fontSize: ms(26),
    lineHeight: ms(30),
  },
  percent: {
    fontFamily: fontFamily.display,
    fontSize: ms(17),
    color: colors.ink2,
    textAlign: 'center',
  },
  steps: {
    width: '100%',
    gap: spacing.md,
    padding: spacing.card,
    borderRadius: ms(22),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepDot: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4EEF0',
  },
  stepDotDone: {
    backgroundColor: colors.mint,
  },
  stepDotActive: {
    backgroundColor: colors.teal100,
  },
  pulse: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: colors.teal,
  },
  stepLabel: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: ms(15.5),
    color: colors.ink3,
  },
  stepLabelOn: {
    color: colors.ink,
  },
});
