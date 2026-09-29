import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedNumber from '@/components/common/AnimatedNumber';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import Ring from '@/components/common/Ring';
import TextComp from '@/components/common/TextComp';
import { duration, enterDown } from '@/config/motion';
import type { CoachResult } from '@/models/coach';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useColors } from '@/styles/theme';
import { radius } from '@/styles/tokens';

type Props = {
  result: CoachResult;
  /** True when this session is the learner's first pronunciation reading. */
  baseline: boolean;
  onDone: () => void;
};

/**
 * The end of a session. The number here is the one that flies back to the
 * pronunciation ring on Home, so it is deliberately the largest thing on the
 * screen — the session has to feel like it went somewhere.
 */
export default function CoachSummary({ result, baseline, onDone }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Retries are separate attempts on the same line, so both of these count
  // distinct lines — "5 lines" out of a four-line session was just wrong.
  const lines = new Set(result.attempts.map((a) => a.lineId)).size;
  const clean = new Set(
    result.attempts.filter((a) => a.takes === 1 && a.score === 100).map((a) => a.lineId),
  ).size;

  return (
    <View style={[styles.root, { paddingTop: insets.top + ms(40) }]}>
      <Animated.View entering={FadeIn.duration(duration.enter)} style={styles.ringWrap}>
        <Ring
          percent={result.score}
          size={168}
          stroke={12}
          delay={180}
          color={colors.skill.pronunciation}
          track={colors.track}
        >
          <AnimatedNumber value={result.score} delay={180} style={styles.score} />
          <TextComp style={styles.outOf}>{t('coach.outOf')}</TextComp>
        </Ring>
      </Animated.View>

      <Animated.View entering={enterDown(140)} style={styles.copy}>
        <TextComp variant="h1" center>
          {baseline ? t('coach.baselineTitle') : t('coach.summaryTitle')}
        </TextComp>
        <TextComp style={styles.body} center>
          {baseline
            ? t('coach.baselineBody')
            : t('coach.summaryBody', { count: lines })}
        </TextComp>
      </Animated.View>

      <Animated.View entering={enterDown(220)} style={styles.stats}>
        <Stat
          icon="check"
          // A green tick over "0 lines" reads as a broken component rather than
          // an honest score, so the tick only earns its colour once there is one.
          tint={clean > 0 ? colors.mint : colors.disabled}
          value={t('coach.cleanCount', { count: clean })}
          label={t('coach.cleanLabel')}
        />
        <View style={styles.divider} />
        <Stat
          icon="trend"
          tint={colors.skill.pronunciation}
          value={
            baseline
              ? t('coach.newSkill')
              : `${result.delta >= 0 ? '+' : ''}${result.delta} ${t('coach.points')}`
          }
          label={t('skills.pronunciation')}
        />
      </Animated.View>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, ms(16)) }]}>
        <ButtonComp onPress={onDone} icon="arrowRight">
          {t('coach.backHome')}
        </ButtonComp>
      </View>
    </View>
  );
}

function Stat({
  icon,
  tint,
  value,
  label,
}: {
  icon: 'check' | 'trend';
  tint: string;
  value: string;
  label: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={14} color="#FFFFFF" />
      </View>
      <TextComp style={styles.statValue}>{value}</TextComp>
      <TextComp style={styles.statLabel}>{label}</TextComp>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: ms(24),
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: fontFamily.display,
    fontSize: ms(54),
    lineHeight: ms(58),
    color: c.ink,
  },
  outOf: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    letterSpacing: 0.4,
    color: c.ink3,
    textTransform: 'uppercase',
  },
  copy: {
    marginTop: ms(28),
    gap: ms(8),
    alignItems: 'center',
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: ms(14.5),
    lineHeight: ms(21),
    color: c.ink2,
    maxWidth: ms(290),
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(28),
    paddingVertical: ms(16),
    paddingHorizontal: ms(8),
    alignSelf: 'stretch',
    borderRadius: radius.card,
    backgroundColor: c.surface,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: ms(5),
  },
  statIcon: {
    width: ms(26),
    height: ms(26),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(15),
    color: c.ink,
  },
  statLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(11.5),
    color: c.ink3,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: c.line,
  },
  foot: {
    marginTop: 'auto',
    alignSelf: 'stretch',
  },
}));
