import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import { easeOut } from '@/config/motion';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, shadows } from '@/styles/tokens';

const FLIGHT_MS = 1600;

type Props = {
  amount: number;
  onDone: () => void;
  style?: StyleProp<ViewStyle>;
};

/** The reward leaving the practice card and landing on the streak. */
export default function XpFly({ amount, onDone, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.set(
      withTiming(1, { duration: FLIGHT_MS, easing: easeOut }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, t]);

  const flight = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [0, 0.2, 0.7, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(t.get(), [0, 0.2, 0.7, 1], [ms(20), 0, -ms(26), -ms(54)]) },
      { scale: interpolate(t.get(), [0, 0.2, 1], [0.6, 1.1, 0.9]) },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.chip, style, flight]}>
      <Icon name="bolt" size={16} color={colors.sunInk} />
      <TextComp style={styles.text}>+{amount} XP</TextComp>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: ms(10),
    paddingVertical: ms(6),
    borderRadius: radius.sm,
    backgroundColor: colors.sun,
    zIndex: 40,
    ...shadows.white,
  },
  text: {
    fontFamily: fontFamily.display,
    fontSize: ms(16),
    color: colors.sunInk,
  },
});
