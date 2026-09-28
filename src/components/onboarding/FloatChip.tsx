import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';
import { radius, shadows } from '@/styles/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rotate?: number;
  delay?: number;
  background?: string;
};

/** The little proof-of-value chips drifting around Buddy on Welcome. */
export default function FloatChip({
  children,
  style,
  rotate = 0,
  delay = 0,
  background = colors.surface,
}: Props) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-ms(10), { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        ),
      ),
    );
  }, [delay, y]);

  const drift = useAnimatedStyle(() => ({
    transform: [{ translateY: y.get() }, { rotate: `${rotate}deg` }],
  }));

  return (
    <Animated.View style={[styles.chip, { backgroundColor: background }, style, drift]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    borderRadius: radius.md,
    ...shadows.white,
  },
});
