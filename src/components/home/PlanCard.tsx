import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import ButtonComp from '@/components/common/ButtonComp';
import Card from '@/components/common/Card';
import HintCard from '@/components/common/HintCard';
import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { duration, smoothLayout, timing } from '@/config/motion';
import { DEFAULTS } from '@/data/mock';
import type { HomeData } from '@/models/home';
import { makeStyles, useColors } from '@/styles/theme';
import { gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

const PIPS = 20;

type Props = {
  subscription: HomeData['subscription'];
  inView: boolean;
  onManage: () => void;
  onTopUp: () => void;
  onSeePlans: () => void;
  highlightKey?: number | null;
};

export default function PlanCard({
  subscription,
  inView,
  onManage,
  onTopUp,
  onSeePlans,
  highlightKey,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const noPlan = !subscription.tier;
  const outOfLessons = !noPlan && subscription.lessonsRemaining === 0;

  if (noPlan) {
    return (
      <Card highlightKey={highlightKey} style={[styles.card, styles.cardDark]}>
        <LinearGradient
          colors={gradients.noPlanCard as unknown as [string, string]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View key="none" entering={FadeIn.duration(280)} exiting={FadeOut.duration(140)}>
          <View style={styles.darkTop}>
            <View style={styles.darkIcon}>
              <Icon name="sparkle" size={22} color={colors.sun} />
            </View>
            <View style={styles.darkHeading}>
              <TextComp style={styles.darkEyebrow}>{t('subscription.noPlanEyebrow')}</TextComp>
              <TextComp style={styles.darkTitle}>{t('subscription.noPlanTitle')}</TextComp>
            </View>
          </View>

          <TextComp style={styles.darkBody}>{t('subscription.noPlanBody')}</TextComp>

          <ButtonComp variant="white" size="sm" onPress={onSeePlans} style={styles.cta}>
            {t('subscription.seePlans')}
          </ButtonComp>
        </Animated.View>
      </Card>
    );
  }

  return (
    <Card highlightKey={highlightKey} style={outOfLessons ? styles.cardWarn : undefined}>
      <View style={styles.header}>
        <TextComp variant="title">{t('subscription.title')}</TextComp>
      </View>

      <Animated.View layout={smoothLayout}>
        <Animated.View
          key={outOfLessons ? 'empty' : 'active'}
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(140)}
        >
          <View style={styles.tierRow}>
            <LinearGradient
              colors={gradients.tierChip as unknown as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tier}
            >
              <Icon name="crown" size={15} color={colors.sunInk} />
              <TextComp style={styles.tierText}>{subscription.tier}</TextComp>
            </LinearGradient>

            <PressableScale
              onPress={onManage}
              accessibilityRole="button"
              accessibilityLabel={t('subscription.manageA11y')}
              style={styles.manage}
            >
              <TextComp style={styles.manageText}>{t('subscription.manage')}</TextComp>
              <Icon name="chevronRight" size={15} color={colors.teal700} strokeWidth={2.8} />
            </PressableScale>
          </View>

          <View style={styles.countRow}>
            <TextComp style={[styles.count, outOfLessons ? styles.countWarn : null]}>
              {subscription.lessonsRemaining} / {subscription.totalLessons}
            </TextComp>
            <TextComp style={styles.countLabel}>{t('subscription.lessonsRemaining')}</TextComp>
          </View>

          <View style={styles.pips}>
            {Array.from({ length: PIPS }, (_, index) => (
              <Pip
                key={index}
                index={index}
                filled={
                  inView &&
                  index <
                    Math.round((subscription.lessonsRemaining / subscription.totalLessons) * PIPS)
                }
              />
            ))}
          </View>

          {outOfLessons ? (
            <>
              <HintCard background={colors.amber50} color={colors.amberInk} style={styles.note}>
                {t('subscription.outNote', { date: DEFAULTS.renewsOn })}
              </HintCard>
              <ButtonComp variant="tonal" icon="plus" onPress={onTopUp} style={styles.cta}>
                {t('subscription.getMore')}
              </ButtonComp>
            </>
          ) : (
            <TextComp style={styles.renews}>
              {t('subscription.renews', { date: DEFAULTS.renewsOn })}
            </TextComp>
          )}
        </Animated.View>
      </Animated.View>
    </Card>
  );
}

function Pip({ index, filled }: { index: number; filled: boolean }) {
  const styles = useStyles();
  const colors = useColors();
  const on = useSharedValue(0);

  useEffect(() => {
    on.set(withDelay(index * 25, withTiming(filled ? 1 : 0, timing(duration.fast))));
  }, [filled, index, on]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [colors.track, colors.teal]),
  }));

  return <Animated.View style={[styles.pip, style]} />;
}

const useStyles = makeStyles((c) => ({
  card: {
    overflow: 'hidden',
  },
  cardDark: {
    borderColor: 'transparent',
  },
  cardWarn: {
    backgroundColor: c.amber50,
    borderColor: c.amber,
  },
  header: {
    marginBottom: ms(10),
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingLeft: ms(8),
    paddingRight: ms(10),
    paddingVertical: ms(5),
    borderRadius: radius.chip,
  },
  tierText: {
    fontFamily: fontFamily.black,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.sunInk,
  },
  manage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2),
    paddingVertical: ms(6),
    paddingLeft: ms(8),
  },
  manageText: {
    fontFamily: fontFamily.black,
    fontSize: ms(13.5),
    lineHeight: ms(17.6),
    color: c.teal700,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: ms(6),
    marginTop: spacing.md,
  },
  count: {
    fontFamily: fontFamily.display,
    fontSize: ms(28),
    lineHeight: ms(35.8),
    letterSpacing: -0.8,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  countWarn: {
    color: c.amberInk,
  },
  countLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(14),
    lineHeight: ms(18.2),
    color: c.ink2,
  },
  pips: {
    flexDirection: 'row',
    gap: ms(3),
    height: ms(10),
    marginTop: spacing.md,
  },
  pip: {
    flex: 1,
    borderRadius: ms(3),
  },
  renews: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink3,
    marginTop: spacing.md,
  },
  note: {
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.md,
  },
  darkTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  darkIcon: {
    width: ms(44),
    height: ms(44),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  darkHeading: {
    flex: 1,
  },
  darkEyebrow: {
    fontFamily: fontFamily.black,
    fontSize: ms(11.5),
    lineHeight: ms(15),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8FB7BE',
  },
  darkTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(19),
    lineHeight: ms(23),
    letterSpacing: -0.3,
    color: c.onAccent,
  },
  darkBody: {
    fontFamily: fontFamily.medium,
    fontSize: ms(14),
    lineHeight: ms(20),
    color: '#B9D4D8',
    marginTop: spacing.md,
  },
}));
