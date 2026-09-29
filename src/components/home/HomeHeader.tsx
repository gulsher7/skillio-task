import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { makeStyles, useColors, useTheme } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { greetingKey } from '@/utils/date';
import { openDemoPanel } from '@/utils/demoPanel';

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
  onLanguagePress: () => void;
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
  onLanguagePress,
  onLayout,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const { scheme, toggle } = useTheme();
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
        <BlurView
          intensity={28}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.wash} />
        <View style={styles.hairline} />
      </Animated.View>

      <Animated.View style={avatar}>
        {/* Long-pressing the avatar opens the dev-only state switcher. */}
        <PressableScale
          haptic="none"
          scaleTo={0.94}
          onLongPress={__DEV__ ? openDemoPanel : undefined}
          delayLongPress={600}
          accessible={false}
        >
          <Avatar uri={avatarUrl} name={name} size={46} />
          <View style={styles.levelBadge}>
            <TextComp style={styles.levelText}>{level}</TextComp>
          </View>
        </PressableScale>
      </Animated.View>

      <Animated.View style={[styles.titleWrap, title]}>
        <TextComp style={styles.title} numberOfLines={2}>
          {t('home.greeting', { greeting: t(`home.${greetingKey()}`), name })}{' '}
          <Animated.Text style={hand} accessibilityElementsHidden>
            👋
          </Animated.Text>
        </TextComp>

        {/* The streak sits with the greeting: both are "here is where you are". */}
        <PressableScale
          onPress={onStreakPress}
          scaleTo={0.94}
          accessibilityRole="button"
          accessibilityLabel={t('home.streakA11y', { count: streakDays })}
          style={styles.streak}
        >
          <Animated.View style={flame}>
            <Icon name="flame" size={15} color={colors.flame} />
          </Animated.View>
          <TextComp style={styles.streakCount}>
            {t('rewards.streak', { count: streakDays })}
          </TextComp>
        </PressableScale>
      </Animated.View>

      <View style={styles.actions}>
        <IconButton
          name="globe"
          size={18}
          label={t('common.language')}
          onPress={onLanguagePress}
          style={styles.action}
        />
        <IconButton
          name={scheme === 'dark' ? 'sun' : 'moon'}
          size={18}
          label={t('home.appearance')}
          onPress={toggle}
          style={styles.action}
        />
        <IconButton
          name="bell"
          size={18}
          label={t('home.notifications')}
          dot
          onPress={onBellPress}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
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
    backgroundColor: c.chrome,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: c.line,
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
    backgroundColor: c.violet,
    borderWidth: 2.5,
    borderColor: c.bg,
  },
  levelText: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    lineHeight: ms(14.3),
    color: c.onAccent,
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
    color: c.ink,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: ms(4),
    marginTop: ms(4),
    paddingLeft: ms(7),
    paddingRight: ms(9),
    paddingVertical: ms(3),
    borderRadius: radius.chip,
    backgroundColor: c.flame50,
  },
  streakCount: {
    fontFamily: fontFamily.black,
    fontSize: ms(12),
    lineHeight: ms(15.6),
    color: c.flameInk,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  action: {
    width: ms(38),
    height: ms(38),
  },
}));
