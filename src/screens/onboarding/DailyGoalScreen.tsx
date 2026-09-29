import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { DAILY_OPTIONS, MONTHS_PER_LEVEL } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setDailyGoal } from '@/redux/reducers/onboardingSlice';
import { enterDown, smoothLayout } from '@/config/motion';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

export default function DailyGoalScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const dailyGoal = useAppSelector((s) => s.onboarding.dailyGoal);
  const hoursPerYear = dailyGoal ? Math.round((dailyGoal * 365) / 60) : null;

  return (
    <OnboardingShell
      step={3}
      title={t('daily.title')}
      subtitle={t('daily.subtitle')}
      onContinue={() => router.push('/focus')}
      ctaDisabled={!dailyGoal}
    >
      <Animated.View layout={smoothLayout} style={styles.stack}>
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
                accessibilityLabel={`${t('plan.dailyValue', { count: option.minutes })}, ${t(
                  `daily.${option.id}`,
                )}`}
                style={[styles.card, selected ? styles.cardSelected : null]}
              >
                {option.popular ? (
                  <View style={styles.badge}>
                    <TextComp style={styles.badgeText}>{t('daily.popular')}</TextComp>
                  </View>
                ) : null}

                <TextComp style={[styles.big, selected ? styles.bigSelected : null]}>
                  {option.minutes}
                </TextComp>
                <TextComp style={styles.unit}>{t('daily.perDay')}</TextComp>
                <TextComp style={styles.label}>{t(`daily.${option.id}`)}</TextComp>

                <View style={[styles.tick, selected ? styles.tickOn : null]}>
                  {selected ? (
                    <Icon name="check" size={14} color={colors.onAccent} strokeWidth={3.4} />
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
        </View>

        {hoursPerYear ? (
          <Animated.View
            key={hoursPerYear}
            entering={enterDown()}
            exiting={FadeOut.duration(140)}
            style={styles.projection}
          >
            <TextComp style={styles.projectionNum}>{hoursPerYear}h</TextComp>
            <TextComp variant="small" style={styles.projectionText}>
              {t('daily.projection', { months: MONTHS_PER_LEVEL(dailyGoal!) })}
            </TextComp>
          </Animated.View>
        ) : null}
      </Animated.View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((c) => ({
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
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  cardSelected: {
    borderColor: c.teal,
    backgroundColor: c.selectedCard,
  },
  big: {
    fontFamily: fontFamily.display,
    fontSize: ms(44),
    lineHeight: ms(53),
    letterSpacing: -1.3,
    color: c.ink,
  },
  bigSelected: {
    color: c.teal,
  },
  unit: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink3,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: ms(15),
    lineHeight: ms(19.5),
    color: c.ink,
    marginTop: ms(8),
  },
  badge: {
    position: 'absolute',
    top: ms(12),
    right: ms(12),
    backgroundColor: c.sun,
    paddingHorizontal: ms(7),
    paddingVertical: ms(3),
    borderRadius: ms(7),
  },
  badgeText: {
    fontFamily: fontFamily.black,
    fontSize: ms(10.5),
    lineHeight: ms(13.7),
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: c.sunInk,
  },
  tick: {
    position: 'absolute',
    right: ms(14),
    bottom: ms(14),
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    borderWidth: 2,
    borderColor: c.tickBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {
    borderColor: c.teal,
    backgroundColor: c.teal,
  },
  projection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
    borderRadius: radius.button,
    backgroundColor: c.inkSurface,
  },
  projectionNum: {
    fontFamily: fontFamily.display,
    fontSize: ms(26),
    lineHeight: ms(33.3),
    color: '#7FE1EA',
    fontVariant: ['tabular-nums'],
  },
  projectionText: {
    flex: 1,
    color: '#B9D4D8',
    lineHeight: ms(19),
  },
}));
