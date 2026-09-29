import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import Buddy from '@/components/brand/Buddy';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import type { HomeData } from '@/models/home';
import { smoothLayout } from '@/config/motion';
import { makeStyles, useColors } from '@/styles/theme';
import { gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms, screen } from '@/styles/scaling';
import { radius, shadows, spacing } from '@/styles/tokens';

type Props = {
  practice: HomeData['dailyPractice'];
  name: string;
  onStart: () => void;
  onViewResults: () => void;
};

/**
 * The one thing we want the student to do today. It owns the only primary CTA
 * on the screen — everything below it is tonal on purpose.
 */
export default function PracticeHero({ practice, name, onStart, onViewResults }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const done = practice.completedToday;
  const result = practice.result;

  return (
    <Animated.View layout={smoothLayout}>
      <LinearGradient
        colors={
          (done ? gradients.questDone : gradients.questCard) as unknown as [string, string, string]
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.card, done ? shadows.heroDone : shadows.hero]}
      >
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 360 300"
          preserveAspectRatio="xMaxYMin slice"
        >
          <Circle cx="330" cy="40" r="110" fill="#FFFFFF" opacity={0.06} />
          <Circle cx="330" cy="40" r="70" fill="#FFFFFF" opacity={0.06} />
          <Path
            d="M-10 250 C 80 210, 160 290, 370 220"
            stroke="#FFFFFF"
            strokeOpacity={0.07}
            strokeWidth={26}
            fill="none"
          />
        </Svg>

        {done ? (
          <Animated.View key="done" entering={FadeIn.duration(280)} exiting={FadeOut.duration(140)}>
            <View style={styles.tag}>
              <Icon name="check" size={14} color={colors.onAccent} strokeWidth={3.2} />
              <TextComp style={styles.tagText}>{t('practiceHero.tagDone')}</TextComp>
            </View>

            <View style={styles.mascotDone} pointerEvents="none">
              <Buddy size={112} mood="cheer" float={false} id="hero-done" />
            </View>

            <TextComp style={[styles.title, styles.titleTop]}>
              {t('practiceHero.complete')}
            </TextComp>

            <Animated.View
              entering={ZoomIn.delay(120).springify().damping(13)}
              style={styles.xpEarned}
            >
              <Icon name="bolt" size={15} color={colors.sunInk} />
              <TextComp style={styles.xpEarnedText}>
                {t('practiceHero.xpEarned', { count: practice.xpReward })}
              </TextComp>
            </Animated.View>

            <View style={styles.stats}>
              <Stat
                value={`${result?.correct ?? 0}/${result?.total ?? 0}`}
                label={t('practiceHero.correct')}
              />
              <Stat value={`${result?.accuracy ?? 0}%`} label={t('practiceHero.accuracy')} />
              <Stat
                value={`${Math.round((result?.seconds ?? 0) / 60)}m`}
                label={t('practiceHero.time')}
              />
            </View>

            <ButtonComp variant="white" onPress={onViewResults}>
              {t('practiceHero.viewResults')}
            </ButtonComp>

            <TextComp style={styles.footnote} center>
              {t('practiceHero.footnote')}
            </TextComp>
          </Animated.View>
        ) : (
          <Animated.View key="todo" entering={FadeIn.duration(280)} exiting={FadeOut.duration(140)}>
            <View style={styles.tag}>
              <Icon name="target" size={14} color={colors.onAccent} strokeWidth={2.6} />
              <TextComp style={styles.tagText}>{t('practiceHero.tagTodo')}</TextComp>
            </View>

            <View style={styles.mascot} pointerEvents="none">
              <Buddy size={112} id="hero" />
            </View>

            <View style={styles.copy}>
              <TextComp style={styles.title}>{practice.topic}</TextComp>
              <TextComp style={styles.subtitle}>
                {t('practiceHero.pickedFor', {
                  focus: practice.focusLabel.toLowerCase(),
                  name,
                })}
              </TextComp>
            </View>

            <View style={styles.pills}>
              <Pill
                icon="list"
                label={t('practiceHero.questions', { count: practice.questionCount })}
              />
              <Pill
                icon="clock"
                label={t('practiceHero.estimate', { count: practice.estimatedMinutes })}
              />
              <Pill
                icon="bolt"
                label={t('practiceHero.xp', { count: practice.xpReward })}
                highlight
              />
            </View>

            <ButtonComp variant="white" icon="play" onPress={onStart}>
              {t('practiceHero.start')}
            </ButtonComp>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

function Pill({
  icon,
  label,
  highlight,
}: {
  icon: 'list' | 'clock' | 'bolt';
  label: string;
  highlight?: boolean;
}) {
  const styles = useStyles();
  const colors = useColors();
  const color = highlight ? colors.sunInk : colors.onAccent;
  return (
    <View style={[styles.pill, highlight ? styles.pillHighlight : null]}>
      <Icon name={icon} size={15} color={color} strokeWidth={2.6} />
      <TextComp style={[styles.pillText, { color }]}>{label}</TextComp>
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
  card: {
    borderRadius: radius.hero,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    alignSelf: 'flex-start',
    paddingHorizontal: ms(10),
    paddingVertical: ms(6),
    borderRadius: radius.chip,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  tagText: {
    fontFamily: fontFamily.black,
    fontSize: ms(11.5),
    lineHeight: ms(15),
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: c.onAccent,
  },
  mascot: {
    position: 'absolute',
    right: -ms(10),
    top: ms(26),
  },
  mascotDone: {
    position: 'absolute',
    right: -ms(4),
    top: ms(20),
  },
  copy: {
    marginTop: spacing.base,
    marginBottom: spacing.lg,
    maxWidth: screen.isSmall ? '62%' : '64%',
    gap: ms(6),
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: ms(26),
    lineHeight: ms(29),
    letterSpacing: -0.6,
    color: c.onAccent,
  },
  titleTop: {
    marginTop: spacing.base,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: ms(14),
    lineHeight: ms(19),
    color: 'rgba(255,255,255,0.85)',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
    marginBottom: spacing.card,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: ms(10),
    paddingVertical: ms(7),
    borderRadius: ms(11),
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  pillHighlight: {
    backgroundColor: c.sun,
  },
  pillText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13.5),
    lineHeight: ms(17.6),
    fontVariant: ['tabular-nums'],
  },
  xpEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: ms(6),
    marginTop: ms(10),
    paddingHorizontal: ms(11),
    paddingVertical: ms(7),
    borderRadius: ms(11),
    backgroundColor: c.sun,
  },
  xpEarnedText: {
    fontFamily: fontFamily.black,
    fontSize: ms(14),
    lineHeight: ms(18.2),
    color: c.sunInk,
  },
  stats: {
    flexDirection: 'row',
    gap: ms(8),
    marginTop: spacing.lg,
    marginBottom: spacing.card,
  },
  stat: {
    flex: 1,
    gap: ms(2),
    paddingHorizontal: ms(10),
    paddingTop: ms(10),
    paddingBottom: ms(9),
    borderRadius: radius.input,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: ms(20),
    lineHeight: ms(25.6),
    color: c.onAccent,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(11.5),
    lineHeight: ms(15),
    color: '#9FC1C7',
  },
  footnote: {
    fontFamily: fontFamily.medium,
    fontSize: ms(12.5),
    lineHeight: ms(16.2),
    color: '#9FC1C7',
    marginTop: spacing.md,
  },
}));
