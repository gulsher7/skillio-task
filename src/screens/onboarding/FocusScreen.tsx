import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { duration, springPop, timing } from '@/config/motion';
import { FOCUS_OPTIONS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { FocusOption } from '@/models/onboarding';
import { toggleFocus } from '@/redux/reducers/onboardingSlice';
import { fontFamily } from '@/styles/fontFamily';
import { ms, screen } from '@/styles/scaling';
import { makeStyles, useColors } from '@/styles/theme';
import { spacing } from '@/styles/tokens';

const GAP = ms(14);
/** Sized so all five bubbles land in one viewport without scrolling. */
const BUBBLE = Math.min(ms(128), (screen.width - spacing.gutter * 2 - GAP) / 2);

/** Nudges alternating bubbles down so the five read as a cloud, not a grid. */
const OFFSETS = [0, ms(20), 0, ms(20), 0];

const FLOAT = ms(6);

function FocusBubble({
  option,
  label,
  selected,
  index,
  onPress,
}: {
  option: FocusOption;
  label: string;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  const hue = colors.hue[option.hue];
  const tint = colors.hueTint[option.hue];
  const reduced = useReducedMotion();
  const on = useSharedValue(selected ? 1 : 0);
  const drift = useSharedValue(0.5);
  const ripple = useSharedValue(0);

  useEffect(() => {
    on.set(selected ? withSpring(1, springPop) : withTiming(0, timing(duration.fast)));
    if (selected) {
      ripple.set(0);
      ripple.set(withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) }));
    }
  }, [selected, on, ripple]);

  useEffect(() => {
    if (reduced) return;
    // Each bubble breathes on its own clock, so the group never marches in step.
    const period = 1900 + index * 230;
    drift.set(
      withDelay(
        index * 180,
        withRepeat(
          withSequence(
            withTiming(0, { duration: period, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        ),
      ),
    );
  }, [drift, index, reduced]);

  const bubble = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(drift.get(), [0, 1], [FLOAT, -FLOAT]) },
      { translateX: interpolate(drift.get(), [0, 1], [-FLOAT / 3, FLOAT / 3]) },
      { scale: interpolate(on.get(), [0, 1], [1, 1.07]) },
    ],
    backgroundColor: interpolateColor(on.get(), [0, 1], [tint, hue]),
    borderColor: interpolateColor(on.get(), [0, 1], [colors.surface, hue]),
    shadowOpacity: interpolate(on.get(), [0, 1], [0.1, 0.34]),
  }));

  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(ripple.get(), [0, 0.3, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(ripple.get(), [0, 1], [0.96, 1.34]) }],
  }));

  const restIcon = useAnimatedStyle(() => ({ opacity: 1 - on.get() }));
  const activeIcon = useAnimatedStyle(() => ({ opacity: on.get() }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(on.get(), [0, 1], [colors.ink, colors.onAccent]),
  }));

  const badge = useAnimatedStyle(() => ({
    opacity: on.get(),
    transform: [{ scale: interpolate(on.get(), [0, 1], [0.4, 1]) }],
  }));

  return (
    <View style={{ marginTop: OFFSETS[index] }}>
      <Animated.View style={[styles.ripple, { borderColor: hue }, ring]} pointerEvents="none" />

      <PressableScale
        onPress={onPress}
        haptic="select"
        scaleTo={0.93}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
      >
        <Animated.View style={[styles.bubble, { shadowColor: hue }, bubble]}>
          <View style={styles.gloss} pointerEvents="none" />

          <View style={styles.iconStack}>
            <Animated.View style={restIcon}>
              <Icon name={option.icon} size={26} color={hue} strokeWidth={2.1} />
            </Animated.View>
            <Animated.View style={[styles.iconOverlay, activeIcon]}>
              <Icon name={option.icon} size={26} color={colors.onAccent} strokeWidth={2.1} />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
            {label}
          </Animated.Text>

          <Animated.View style={[styles.badge, badge]}>
            <Icon name="check" size={12} color={hue} strokeWidth={3.6} />
          </Animated.View>
        </Animated.View>
      </PressableScale>
    </View>
  );
}

export default function FocusScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const focus = useAppSelector((s) => s.onboarding.focus);

  return (
    <OnboardingShell
      step={4}
      title={t('focus.title')}
      subtitle={t('focus.subtitle')}
      onContinue={() => router.push('/name')}
      ctaDisabled={focus.length === 0}
      ctaLabel={focus.length ? t('common.continueSelected', { count: focus.length }) : undefined}
    >
      <View style={styles.cloud}>
        {FOCUS_OPTIONS.map((option, index) => (
          <FocusBubble
            key={option.id}
            option={option}
            index={index}
            label={t(`focus.${option.id}`)}
            selected={focus.includes(option.id)}
            onPress={() => dispatch(toggleFocus(option.id))}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((c) => ({
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: GAP,
    rowGap: GAP,
    paddingTop: spacing.sm,
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: ms(10) },
    shadowRadius: ms(16),
    elevation: 4,
  },
  /** The specular highlight that makes a flat circle read as a bubble. */
  gloss: {
    position: 'absolute',
    top: '13%',
    left: '16%',
    width: '38%',
    height: '20%',
    borderRadius: BUBBLE / 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '-24deg' }],
  },
  ripple: {
    ...StyleSheet.absoluteFill,
    borderRadius: BUBBLE / 2,
    borderWidth: 2,
  },
  iconStack: {
    width: ms(28),
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.black,
    fontSize: ms(12.5),
    lineHeight: ms(16.3),
    paddingHorizontal: ms(5),
  },
  badge: {
    position: 'absolute',
    top: '14%',
    right: '14%',
    width: ms(21),
    height: ms(21),
    borderRadius: ms(10.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
  },
}));
