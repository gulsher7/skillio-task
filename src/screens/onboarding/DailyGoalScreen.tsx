import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { DAILY_OPTIONS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setDailyGoal } from '@/redux/reducers/onboardingSlice';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

/** How long a level takes at this pace — the reason the projection lands. */
const monthsPerLevel = (minutes: number) => (minutes >= 15 ? '5' : minutes >= 10 ? '7' : '10');

export default function DailyGoalScreen() {
  const dispatch = useAppDispatch();
  const dailyGoal = useAppSelector((s) => s.onboarding.dailyGoal);
  const hoursPerYear = dailyGoal ? Math.round((dailyGoal * 365) / 60) : null;

  return (
    <OnboardingShell
      step={3}
      title="How much time can you learn each day?"
      subtitle="Small daily sessions beat long weekly ones."
      onContinue={() => router.push('/focus')}
      ctaDisabled={!dailyGoal}
    >
      <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.stack}>
        <View style={styles.grid} accessibilityRole="radiogroup">
          {DAILY_OPTIONS.map((option) => {
            const selected = dailyGoal === option.minutes;
            return (
              <PressableScale
                key={option.minutes}
                haptic="select"
                scaleTo={0.97}
                onPress={() => dispatch(setDailyGoal(option.minutes))}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.minutes} minutes a day, ${option.label}`}
                style={[styles.card, selected ? styles.cardSelected : null]}
              >
                {option.popular ? (
                  <View style={styles.badge}>
                    <TextComp style={styles.badgeText}>Popular</TextComp>
                  </View>
                ) : null}

                <TextComp style={[styles.big, selected ? styles.bigSelected : null]}>
                  {option.minutes}
                </TextComp>
                <TextComp style={styles.unit}>minutes / day</TextComp>
                <TextComp style={styles.label}>{option.label}</TextComp>

                <View style={[styles.tick, selected ? styles.tickOn : null]}>
                  {selected ? (
                    <Icon name="check" size={14} color={colors.surface} strokeWidth={3.4} />
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
        </View>

        {hoursPerYear ? (
          <Animated.View
            key={hoursPerYear}
            entering={FadeInDown.springify().damping(18)}
            exiting={FadeOut.duration(140)}
            style={styles.projection}
          >
            <TextComp style={styles.projectionNum}>{hoursPerYear}h</TextComp>
            <TextComp variant="small" style={styles.projectionText}>
              of English practice a year. That is roughly one CEFR level every{' '}
              {monthsPerLevel(dailyGoal!)} months.
            </TextComp>
          </Animated.View>
        ) : null}
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47.6%',
    flexGrow: 1,
    paddingTop: ms(18),
    paddingBottom: ms(16),
    paddingHorizontal: ms(16),
    borderRadius: ms(22),
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.selectedCard,
  },
  big: {
    fontFamily: fontFamily.display,
    fontSize: ms(44),
    lineHeight: ms(46),
    letterSpacing: -1.3,
    color: colors.ink,
  },
  bigSelected: {
    color: colors.teal,
  },
  unit: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13),
    color: colors.ink3,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: ms(15),
    color: colors.ink,
    marginTop: ms(8),
  },
  badge: {
    position: 'absolute',
    top: ms(12),
    right: ms(12),
    backgroundColor: colors.sun,
    paddingHorizontal: ms(7),
    paddingVertical: ms(3),
    borderRadius: ms(7),
  },
  badgeText: {
    fontFamily: fontFamily.black,
    fontSize: ms(10.5),
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.sunInk,
  },
  tick: {
    position: 'absolute',
    right: ms(14),
    bottom: ms(14),
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    borderWidth: 2,
    borderColor: '#CFDDE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  projection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
    borderRadius: radius.button,
    backgroundColor: colors.ink,
  },
  projectionNum: {
    fontFamily: fontFamily.display,
    fontSize: ms(26),
    color: '#7FE1EA',
    fontVariant: ['tabular-nums'],
  },
  projectionText: {
    flex: 1,
    color: '#B9D4D8',
    lineHeight: ms(19),
  },
});
