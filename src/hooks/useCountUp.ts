import { useEffect } from 'react';
import { useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';

import { duration as motion, timing } from '@/config/motion';

type Options = {
  from?: number;
  duration?: number;
  delay?: number;
  /** Hold at `from` until the card is actually on screen. */
  run?: boolean;
};

/**
 * Counts a number up on the UI thread. Pair it with <AnimatedNumber /> so the
 * ticking never crosses the bridge.
 */
export function useCountUp(target: number, options: Options = {}): SharedValue<number> {
  const { from = 0, duration = motion.count, delay = 0, run = true } = options;
  const value = useSharedValue(from);

  useEffect(() => {
    if (!run) return;
    value.set(withDelay(delay, withTiming(target, timing(duration))));
  }, [target, run, delay, duration, value]);

  return value;
}
