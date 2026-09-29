import {
  Easing,
  FadeInDown,
  LinearTransition,
  ReduceMotion,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

/** The one curve everything enters on. Fast out of the gate, long settle. */
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIn = Easing.bezier(0.4, 0, 1, 1);

export const duration = {
  press: 90,
  fast: 220,
  base: 320,
  enter: 440,
  slow: 600,
  count: 1100,
  journey: 1600,
} as const;

/**
 * Marked as a worklet so it can build a config on either runtime — animations
 * driven from inside `useAnimatedStyle` or `useDerivedValue` need it on the UI
 * thread, and without this they fail as a remote call.
 */
export const timing = (ms: number = duration.base): WithTimingConfig => {
  'worklet';
  return {
    duration: ms,
    easing: easeOut,
    reduceMotion: ReduceMotion.System,
  };
};

/** Pops: checkmarks, badges, the streak bump. */
export const springPop: WithSpringConfig = {
  damping: 12,
  stiffness: 180,
  mass: 0.9,
  reduceMotion: ReduceMotion.System,
};

/** Releases: press states settling back to rest. */
export const springSoft: WithSpringConfig = {
  damping: 18,
  stiffness: 240,
  mass: 0.7,
  reduceMotion: ReduceMotion.System,
};

/** How far apart sibling cards enter. */
export const STAGGER = 50;

export const PRESS_SCALE = 0.965;

/**
 * Screens and cards enter on a curve, not a spring — overshoot on a whole
 * screen of content reads as wobble. Springs stay for object-level feedback:
 * check marks, the mascot, the streak igniting.
 */
export const enterDown = (delay = 0) =>
  FadeInDown.delay(delay).duration(duration.enter).easing(easeOut);

/** Height and position changes when Home swaps state. */
export const smoothLayout = LinearTransition.duration(duration.base).easing(easeOut);
