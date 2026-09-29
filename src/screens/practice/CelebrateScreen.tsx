import { Canvas, Rect, RadialGradient, vec } from '@shopify/react-native-skia';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Buddy from '@/components/brand/Buddy';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import Confetti, { type ConfettiHandle } from '@/components/fx/Confetti';
import { duration, enterDown, springPop, STAGGER } from '@/config/motion';
import { DEFAULTS, SAMPLE_RESULT } from '@/data/mock';
import { useAppSelector } from '@/hooks/useRedux';
import { makeStyles, useColors } from '@/styles/theme';
import { gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { formatDuration } from '@/utils/date';

const XP = DEFAULTS.practice.xpReward;

export default function CelebrateScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const result = useAppSelector((s) => s.home.result) ?? SAMPLE_RESULT;
  const streak = DEFAULTS.game.streakDays + 1;

  const confetti = useRef<ConfettiHandle>(null);
  const entrance = useSharedValue(0);
  const hop = useSharedValue(0);
  const flame = useSharedValue(0);

  useEffect(() => {
    entrance.set(withSpring(1, { damping: 11, stiffness: 150 }));
    hop.set(
      withDelay(
        900,
        withRepeat(
          withSequence(
            withTiming(-ms(14), { duration: 480, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) }),
            withTiming(0, { duration: 500 }),
          ),
          -1,
          false,
        ),
      ),
    );
    flame.set(withDelay(600, withSpring(1, springPop)));

    const bursts = [
      setTimeout(() => confetti.current?.fire({ y: 0.28, count: 190 }), 250),
      setTimeout(() => confetti.current?.fire({ y: 0.5, x: 0.2, count: 80 }), 900),
      setTimeout(() => confetti.current?.fire({ y: 0.5, x: 0.8, count: 80 }), 1100),
    ];
    return () => bursts.forEach(clearTimeout);
  }, [entrance, hop, flame]);

  const mascot = useAnimatedStyle(() => ({
    opacity: entrance.get(),
    transform: [{ scale: entrance.get() }, { translateY: hop.get() }],
  }));

  const flamePop = useAnimatedStyle(() => ({ transform: [{ scale: flame.get() }] }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width / 2, height * 0.26)}
            r={Math.max(width, height) * 0.62}
            colors={gradients.celebrate as unknown as string[]}
          />
        </Rect>
      </Canvas>

      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        <Animated.View style={mascot}>
          <Buddy size={150} mood="cheer" float={false} id="celebrate" />
        </Animated.View>

        <Animated.View entering={enterDown(STAGGER * 2)}>
          <TextComp variant="h1" center style={styles.title}>
            {t('celebrate.title')}
          </TextComp>
        </Animated.View>

        <Animated.View entering={enterDown(STAGGER * 3)}>
          <AnimatedNumber
            value={XP}
            prefix="+"
            suffix=" XP"
            duration={duration.count + 100}
            style={styles.xp}
          />
        </Animated.View>

        <Animated.View entering={enterDown(STAGGER * 4)} style={styles.streak}>
          <Animated.View style={[styles.flame, flamePop]}>
            <Icon name="flame" size={22} color={colors.onAccent} />
          </Animated.View>
          <TextComp style={styles.streakText}>{t('celebrate.streak', { count: streak })}</TextComp>
        </Animated.View>

        <Animated.View entering={enterDown(STAGGER * 5)} style={styles.stats}>
          <Stat value={`${result.correct}/${result.total}`} label={t('celebrate.correct')} />
          <Stat value={`${result.accuracy}%`} label={t('celebrate.accuracy')} />
          <Stat value={formatDuration(result.seconds).split(' ')[0]} label={t('celebrate.time')} />
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <ButtonComp variant="white" onPress={() => router.back()}>
          {t('celebrate.continue')}
        </ButtonComp>
      </View>

      <Confetti ref={confetti} />
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <TextComp style={styles.statValue}>{value}</TextComp>
      <TextComp style={styles.statLabel}>{label}</TextComp>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: '#07808D',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontSize: ms(32),
    lineHeight: ms(36),
    color: c.onAccent,
  },
  xp: {
    fontFamily: fontFamily.display,
    fontSize: ms(64),
    lineHeight: ms(77),
    letterSpacing: -2,
    color: c.sun,
    textAlign: 'center',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: ms(10),
    paddingRight: ms(16),
    paddingVertical: ms(10),
    borderRadius: radius.option,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  flame: {
    width: ms(38),
    height: ms(38),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.flame,
  },
  streakText: {
    flexShrink: 1,
    fontFamily: fontFamily.black,
    fontSize: ms(14.5),
    lineHeight: ms(18.9),
    color: c.onAccent,
  },
  stats: {
    flexDirection: 'row',
    gap: ms(10),
    width: '100%',
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: ms(2),
    paddingVertical: ms(12),
    borderRadius: radius.option,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: ms(22),
    lineHeight: ms(28.2),
    color: c.onAccent,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12),
    lineHeight: ms(15.6),
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
  },
}));
