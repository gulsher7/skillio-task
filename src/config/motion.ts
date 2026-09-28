import {
  Easing,
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

export const timing = (ms: number = duration.base): WithTimingConfig => ({
  duration: ms,
  easing: easeOut,
  reduceMotion: ReduceMotion.System,
});

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
