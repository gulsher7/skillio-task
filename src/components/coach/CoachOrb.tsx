import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import TextComp from '@/components/common/TextComp';
import { duration, springSoft, timing } from '@/config/motion';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useTheme } from '@/styles/theme';
import { radius, shadows } from '@/styles/tokens';
import { haptics } from '@/utils/haptics';

import { ORB } from './geometry';

const LIQUID_GLASS = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/** Past this much scrolling the orb steps aside; scrolling back brings it out. */
const DUCK_AFTER = ms(24);

/** Clearance between the nudge bubble and the orb it hangs off. */
const BUBBLE_GAP = ms(8);

/** How far the bubble slides out from behind the orb. */
const BUBBLE_SLIDE = ms(12);

type Props = {
  /** Distance from the right and bottom edges to the orb's near corner. */
  right: number;
  bottom: number;
  /** 0 = collapsed at rest, 1 = fully expanded into the session. */
  morph: SharedValue<number>;
  /** Home's scroll offset, so the orb can duck out of the way. */
  scrollY: SharedValue<number>;
  /** The nudge to show, or null to stay quiet. */
  nudge: string | null;
  onPress: () => void;
  label: string;
};

/**
 * The orb's chrome: the glass disc, the nudge that peeks out of it and the hit
 * area. The living part inside it — the ring of bars — is drawn by
 * `VoiceCanvas`, which owns one canvas for both the orb and the waveform it
 * becomes.
 */
export default function CoachOrb({ right, bottom, morph, scrollY, nudge, onPress, label }: Props) {
  const styles = useStyles();
  const { scheme } = useTheme();

  // Ducking follows scroll direction rather than depth: the orb is only in the
  // way while you are reading past it, and it should be back the instant you
  // turn around.
  const duck = useDerivedValue(() => {
    const y = scrollY.get();
    return withTiming(y > DUCK_AFTER ? 1 : 0, timing(duration.fast));
  });

  const disc = useAnimatedStyle(() => {
    const m = morph.get();
    const shrink = interpolate(duck.get(), [0, 1], [1, 0.72]);
    return {
      // Expanding hands the stage to the waveform, so the disc gets out of its
      // own way rather than scaling up into a blank circle.
      opacity: (1 - m) * interpolate(duck.get(), [0, 1], [1, 0.6]),
      transform: [{ scale: (1 - m * 0.35) * shrink }],
    };
  });

  const bubble = useAnimatedStyle(() => {
    const hidden = morph.get() > 0.01 || duck.get() > 0.5 || !nudge;
    return {
      opacity: withTiming(hidden ? 0 : 1, timing(duration.base)),
      transform: [
        { scale: withSpring(hidden ? 0.86 : 1, springSoft) },
        { translateX: withTiming(hidden ? BUBBLE_SLIDE : 0, timing(duration.base)) },
      ],
    };
  });

  return (
    <>
      {nudge ? (
        <Animated.View
          style={[
            styles.bubbleWrap,
            { right: right + ORB + BUBBLE_GAP, bottom: bottom + ORB / 2 - ms(18) },
            bubble,
          ]}
          pointerEvents="box-none"
        >
          <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={nudge}>
            <View style={styles.bubble}>
              <TextComp style={styles.bubbleText} numberOfLines={2}>
                {nudge}
              </TextComp>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.wrap, { right, bottom }, disc]} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            haptics.medium();
            onPress();
          }}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.disc, LIQUID_GLASS ? styles.discGlass : styles.discBlur]}
        >
          {LIQUID_GLASS ? (
            <GlassView
              glassEffectStyle="regular"
              isInteractive
              style={[StyleSheet.absoluteFill, styles.glass]}
            />
          ) : (
            <>
              <BlurView
                intensity={40}
                tint={scheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.wash} />
            </>
          )}
        </Pressable>
      </Animated.View>
    </>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: {
    position: 'absolute',
    width: ORB,
    height: ORB,
  },
  disc: {
    flex: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  discGlass: {
    backgroundColor: 'transparent',
  },
  discBlur: {
    borderWidth: 1,
    borderColor: c.line,
    ...shadows.tabBar,
  },
  glass: {
    borderRadius: radius.pill,
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: c.chromeStrong,
  },
  bubbleWrap: {
    position: 'absolute',
    maxWidth: ms(216),
  },
  bubble: {
    backgroundColor: c.inkSurface,
    borderRadius: radius.md,
    paddingHorizontal: ms(12),
    paddingVertical: ms(9),
    ...shadows.toast,
  },
  bubbleText: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(12.5),
    lineHeight: ms(16.5),
    color: c.onInkSurface,
  },
}));
