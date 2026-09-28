import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import IconTile from '@/components/common/IconTile';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { duration, springPop, timing } from '@/config/motion';
import { FOCUS_OPTIONS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { FocusOption } from '@/models/onboarding';
import { toggleFocus } from '@/redux/reducers/onboardingSlice';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

function FocusChip({
  option,
  selected,
  onPress,
}: {
  option: FocusOption;
  selected: boolean;
  onPress: () => void;
}) {
  const on = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    on.set(selected ? withSpring(1, springPop) : withTiming(0, timing(duration.fast)));
  }, [selected, on]);

  const chip = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.get(), [0, 1], [colors.line, colors.teal]),
    backgroundColor: interpolateColor(on.get(), [0, 1], [colors.surface, colors.selectedCard]),
  }));

  const tile = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(on.get(), [0, 1], [1, 1.1]) },
      { rotate: `${interpolate(on.get(), [0, 1], [0, -8])}deg` },
    ],
  }));

  const tick = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.get(), [0, 1], ['#CFDDE0', colors.teal]),
    backgroundColor: interpolateColor(on.get(), [0, 1], ['transparent', colors.teal]),
  }));

  const tickIcon = useAnimatedStyle(() => ({ opacity: on.get() }));

  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      scaleTo={0.95}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={option.label}
    >
      <Animated.View style={[styles.chip, chip]}>
        <Animated.View style={tile}>
          <IconTile
            name={option.icon}
            color={option.color}
            background={option.tint}
            size={34}
            iconSize={19}
            radius={11}
          />
        </Animated.View>

        <TextComp style={styles.chipLabel}>{option.label}</TextComp>

        <Animated.View style={[styles.tick, tick]}>
          <Animated.View style={tickIcon}>
            <Icon name="check" size={13} color={colors.surface} strokeWidth={3.6} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </PressableScale>
  );
}

export default function FocusScreen() {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((s) => s.onboarding.focus);

  return (
    <OnboardingShell
      step={4}
      title="What would you like to focus on?"
      subtitle="Choose as many as you like."
      onContinue={() => router.push('/name')}
      ctaDisabled={focus.length === 0}
      ctaLabel={focus.length ? `Continue · ${focus.length} selected` : 'Continue'}
    >
      <View style={styles.wrap}>
        {FOCUS_OPTIONS.map((option) => (
          <FocusChip
            key={option.id}
            option={option}
            selected={focus.includes(option.id)}
            onPress={() => dispatch(toggleFocus(option.id))}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: ms(12),
    paddingLeft: ms(12),
    paddingRight: ms(16),
    borderRadius: radius.button,
    borderWidth: 2,
  },
  chipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(15.5),
    color: colors.ink,
  },
  tick: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
