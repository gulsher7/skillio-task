import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { duration, springPop, timing } from '@/config/motion';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius } from '@/styles/tokens';

type Props = {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  /** Icon tile, signal bars — whatever sits on the left. */
  leading?: React.ReactNode;
  titleAccessory?: React.ReactNode;
  /** Radio reads as a circle, checkbox as a rounded square. */
  shape?: 'circle' | 'square';
  role?: 'radio' | 'checkbox';
  style?: StyleProp<ViewStyle>;
};

export default function OptionCard({
  selected,
  onPress,
  title,
  subtitle,
  leading,
  titleAccessory,
  shape = 'circle',
  role = 'radio',
  style,
}: Props) {
  const on = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    on.set(selected ? withSpring(1, springPop) : withTiming(0, timing(duration.fast)));
  }, [selected, on]);

  const card = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.get(), [0, 1], [colors.line, colors.teal]),
    backgroundColor: interpolateColor(on.get(), [0, 1], [colors.surface, colors.selectedCard]),
  }));

  const leadingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(on.get(), [0, 1], [1, 1.08]) },
      { rotate: `${interpolate(on.get(), [0, 1], [0, -4])}deg` },
    ],
  }));

  const tick = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.get(), [0, 1], ['#CFDDE0', colors.teal]),
    backgroundColor: interpolateColor(on.get(), [0, 1], ['transparent', colors.teal]),
    transform: [{ scale: interpolate(on.get(), [0, 1], [1, 1.04]) }],
  }));

  const tickIcon = useAnimatedStyle(() => ({
    opacity: on.get(),
    transform: [{ scale: interpolate(on.get(), [0, 1], [0.4, 1]) }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      scaleTo={0.975}
      accessibilityRole={role}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={style}
    >
      <Animated.View style={[styles.card, card]}>
        {leading ? <Animated.View style={leadingStyle}>{leading}</Animated.View> : null}

        <View style={styles.text}>
          <View style={styles.titleRow}>
            <TextComp style={styles.title}>{title}</TextComp>
            {titleAccessory}
          </View>
          {subtitle ? (
            <TextComp variant="small" style={styles.subtitle}>
              {subtitle}
            </TextComp>
          ) : null}
        </View>

        <Animated.View style={[styles.tick, shape === 'square' ? styles.tickSquare : null, tick]}>
          <Animated.View style={tickIcon}>
            <Icon name="check" size={15} color={colors.surface} strokeWidth={3.4} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(14),
    paddingVertical: ms(13),
    paddingHorizontal: ms(14),
    borderRadius: radius.option,
    borderWidth: 2,
    minHeight: ms(70),
  },
  text: {
    flex: 1,
    gap: ms(2),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    lineHeight: ms(20),
    color: colors.ink,
  },
  subtitle: {
    color: colors.ink2,
    lineHeight: ms(18),
  },
  tick: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickSquare: {
    borderRadius: ms(8),
  },
});
