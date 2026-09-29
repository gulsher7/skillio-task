import { forwardRef, useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { duration, timing } from '@/config/motion';
import { makeStyles, useColors } from '@/styles/theme';
import { radius, spacing } from '@/styles/tokens';

type Props = ViewProps & {
  /**
   * Changes whenever the demo panel jumps to this section. A new value pulses a
   * teal ring so it is obvious where you landed.
   */
  highlightKey?: number | null;
};

const Card = forwardRef<View, Props>(({ style, highlightKey, children, ...rest }, ref) => {
  const styles = useStyles();
  const colors = useColors();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!highlightKey) return;
    glow.set(
      withSequence(
        withTiming(1, timing(duration.fast)),
        withDelay(400, withTiming(0, timing(duration.slow))),
      ),
    );
  }, [highlightKey, glow]);

  const ring = useAnimatedStyle(() => ({
    borderColor: glow.get() > 0.5 ? colors.teal : colors.line,
    shadowOpacity: glow.get() * 0.5,
  }));

  return (
    <Animated.View ref={ref} {...rest} style={[styles.card, ring, style]}>
      {children}
    </Animated.View>
  );
});

Card.displayName = 'Card';
export default Card;

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.card,
    shadowColor: c.teal,
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
}));
