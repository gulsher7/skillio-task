import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/brand/Avatar';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { greeting } from '@/utils/date';

const SCROLL_RANGE = [0, 48] as const;

type Props = {
  name: string;
  avatarUrl: string;
  level: number;
  streakDays: number;
  scrollY: SharedValue<number>;
  /** Ticks up when practice completes, which makes the flame jump. */
  streakPulse: SharedValue<number>;
  onStreakPress: () => void;
  onBellPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

export default function HomeHeader({
  name,
  avatarUrl,
  level,
  streakDays,
  scrollY,
  streakPulse,
  onStreakPress,
  onBellPress,
  onLayout,
}: Props) {
  const insets = useSafeAreaInsets();
  const wave = useSharedValue(0);

  useEffect(() => {
    wave.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(-0.5, { duration: 180 }),
          withTiming(1, { duration: 180 }),
          withTiming(0, { duration: 180 }),
          withTiming(0, { duration: 700 }),
        ),
        2,
        false,
      ),
    );
  }, [wave]);

  const chrome = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [6, 30], [0, 1], Extrapolation.CLAMP),
  }));

  const avatar = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scrollY.get(), SCROLL_RANGE, [1, 0.84], Extrapolation.CLAMP),
      },
    ],
  }));

  const title = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.get(), SCROLL_RANGE, [1, 0.81], Extrapolation.CLAMP) },
    ],
  }));

  const hand = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(wave.get(), [-0.5, 1], [-8, 16])}deg` }],
  }));

  const flame = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(streakPulse.get(), [0, 1], [1, 1.25]) },
      { rotate: `${interpolate(streakPulse.get(), [0, 1], [0, -6])}deg` },
    ],
  }));

  return (
    <View onLayout={onLayout} style={[styles.header, { paddingTop: insets.top + ms(6) }]}>
      <Animated.View style={[StyleSheet.absoluteFill, chrome]}>
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.wash} />
        <View style={styles.hairline} />
      </Animated.View>

      <Animated.View style={avatar}>
        <Avatar uri={avatarUrl} name={name} size={46} />
        <View style={styles.levelBadge}>
          <TextComp style={styles.levelText}>{level}</TextComp>
        </View>
      </Animated.View>

      <Animated.View style={[styles.titleWrap, title]}>
        <TextComp style={styles.title} numberOfLines={2}>
          {greeting()}, {name}{' '}
          <Animated.Text style={hand} accessibilityElementsHidden>
            👋
          </Animated.Text>
        </TextComp>
      </Animated.View>

      <PressableScale
        onPress={onStreakPress}
        scaleTo={0.92}
        accessibilityRole="button"
        accessibilityLabel={`${streakDays} day streak. Opens rewards.`}
        style={styles.streak}
      >
        <Animated.View style={flame}>
          <Icon name="flame" size={20} color={colors.flame} />
        </Animated.View>
        <TextComp style={styles.streakCount}>{streakDays}</TextComp>
      </PressableScale>

      <IconButton name="bell" label="Notifications" dot onPress={onBellPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(243,248,249,0.72)',
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  levelBadge: {
    position: 'absolute',
    right: -ms(4),
    bottom: -ms(4),
    minWidth: ms(22),
    height: ms(22),
    paddingHorizontal: ms(5),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.violet,
    borderWidth: 2.5,
    borderColor: colors.bg,
  },
  levelText: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    color: colors.surface,
    fontVariant: ['tabular-nums'],
  },
  titleWrap: {
    flex: 1,
    transformOrigin: 'left center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: ms(21),
    lineHeight: ms(24),
    letterSpacing: -0.5,
    color: colors.ink,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    height: ms(40),
    paddingLeft: ms(9),
    paddingRight: ms(12),
    borderRadius: radius.md,
    backgroundColor: colors.flame50,
  },
  streakCount: {
    fontFamily: fontFamily.display,
    fontSize: ms(16),
    color: colors.flameInk,
    fontVariant: ['tabular-nums'],
  },
});
