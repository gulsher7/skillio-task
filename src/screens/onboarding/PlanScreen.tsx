import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Buddy from '@/components/brand/Buddy';
import CefrTag from '@/components/common/CefrTag';
import Icon from '@/components/common/Icon';
import IconTile from '@/components/common/IconTile';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { DEFAULTS } from '@/data/mock';
import { FOCUS_OPTIONS, GOALS, LEVELS, WEEKS_TO_NEXT_LEVEL } from '@/data/onboardingOptions';
import { useAppSelector } from '@/hooks/useRedux';
import { makeStyles, useColors } from '@/styles/theme';
import { gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, shadows, spacing } from '@/styles/tokens';

export default function PlanScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const { goal, level, dailyGoal, focus, name } = useAppSelector((s) => s.onboarding);

  const chosenGoal = GOALS.find((g) => g.id === goal) ?? GOALS[0];
  const chosenLevel = LEVELS.find((l) => l.id === level) ?? LEVELS[2];
  const chosenFocus = FOCUS_OPTIONS.filter((f) => focus.includes(f.id));
  const minutes = dailyGoal ?? 10;
  const weeks = WEEKS_TO_NEXT_LEVEL[minutes];
  const displayName = name.trim() || DEFAULTS.userName;
  const focusList = chosenFocus.length ? chosenFocus : FOCUS_OPTIONS.slice(0, 2);

  const topics = focusList
    .slice(0, 2)
    .map((f) => t(`focus.${f.id}`).toLowerCase())
    .join(' + ');

  const perks = [
    {
      icon: 'flame' as const,
      color: colors.flame,
      tint: colors.flame50,
      title: t('plan.perkStreak'),
      body: t('plan.perkStreakBody'),
    },
    {
      icon: 'bolt' as const,
      color: colors.amberInk,
      tint: colors.sun50,
      title: t('plan.perkXp', { count: DEFAULTS.practice.xpReward }),
      body: t('plan.perkXpBody'),
    },
    {
      icon: 'target' as const,
      color: colors.teal,
      tint: colors.teal50,
      title: t('plan.perkGoal', { count: minutes }),
      body: t('plan.perkGoalBody'),
    },
    {
      icon: 'sparkle' as const,
      color: colors.violet,
      tint: colors.violet50,
      title: t('plan.perkLessons'),
      body: t('plan.perkLessonsBody', { topics }),
    },
  ];

  return (
    <OnboardingShell
      step={5}
      complete
      title={t('plan.title', { name: displayName, level: chosenLevel.next })}
      onContinue={() => router.push('/building')}
      ctaLabel={t('plan.cta')}
    >
      <View style={styles.stack}>
        <TextComp variant="eyebrow" style={styles.eyebrow}>
          {t('plan.eyebrow')}
        </TextComp>
        <View style={styles.planCard}>
          <LinearGradient
            colors={gradients.planHeader as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planTop}
          >
            <View style={styles.planGlow} />
            <Buddy size={58} mood="cheer" float={false} id="plan" />
            <View style={styles.planTopText}>
              <TextComp style={styles.planTopLabel}>
                {t('plan.estimate', { level: chosenLevel.next })}
              </TextComp>
              <TextComp style={styles.planTopValue}>{t('plan.weeks', { count: weeks })}</TextComp>
            </View>
          </LinearGradient>

          <Row label={t('plan.rowName')}>
            <TextComp style={styles.value}>{displayName}</TextComp>
          </Row>
          <Row label={t('plan.rowGoal')}>
            <Icon name={chosenGoal.icon} size={18} color={colors.hue[chosenGoal.hue]} />
            <TextComp style={styles.value}>{t(`goal.${chosenGoal.id}`)}</TextComp>
          </Row>
          <Row label={t('plan.rowLevel')}>
            <TextComp style={styles.value}>{t(`level.${chosenLevel.id}`)}</TextComp>
            <CefrTag level={chosenLevel.cefr} />
            <Icon name="chevronRight" size={14} color={colors.ink3} strokeWidth={3} />
            <CefrTag level={chosenLevel.next} filled />
          </Row>
          <Row label={t('plan.rowDaily')}>
            <TextComp style={styles.value}>{t('plan.dailyValue', { count: minutes })}</TextComp>
          </Row>
          <Row label={t('plan.rowFocus')}>
            {focusList.map((f) => (
              <TextComp key={f.id} style={styles.miniChip}>
                {t(`focus.${f.id}`)}
              </TextComp>
            ))}
          </Row>
        </View>

        <View style={styles.perks}>
          {perks.map((perk) => (
            <View key={perk.title} style={styles.perk}>
              <IconTile
                name={perk.icon}
                color={perk.color}
                background={perk.tint}
                size={36}
                iconSize={20}
                radius={12}
              />
              <TextComp style={styles.perkTitle}>{perk.title}</TextComp>
              <TextComp variant="tiny" style={styles.perkBody}>
                {perk.body}
              </TextComp>
            </View>
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <TextComp style={styles.rowLabel}>{label}</TextComp>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  stack: {
    gap: spacing.lg,
  },
  eyebrow: {
    color: c.teal,
    marginBottom: -spacing.sm,
  },
  planCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
    overflow: 'hidden',
    ...shadows.white,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.card,
    overflow: 'hidden',
  },
  planGlow: {
    position: 'absolute',
    right: -ms(40),
    top: -ms(60),
    width: ms(180),
    height: ms(180),
    borderRadius: ms(90),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  planTopText: {
    flex: 1,
  },
  planTopLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: 'rgba(255,255,255,0.85)',
  },
  planTopValue: {
    fontFamily: fontFamily.display,
    fontSize: ms(30),
    lineHeight: ms(38.4),
    letterSpacing: -0.8,
    color: c.onAccent,
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: ms(13),
    paddingHorizontal: spacing.card,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  rowLabel: {
    width: ms(84),
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    lineHeight: ms(16.2),
    color: c.ink3,
  },
  rowValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(6),
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: ms(15),
    lineHeight: ms(19.5),
    color: c.ink,
  },
  miniChip: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    lineHeight: ms(16.2),
    paddingHorizontal: ms(9),
    paddingVertical: ms(4),
    borderRadius: ms(9),
    overflow: 'hidden',
    backgroundColor: c.teal50,
    color: c.teal700,
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  perk: {
    width: '47.6%',
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: radius.option,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  perkTitle: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
    lineHeight: ms(19.5),
    color: c.ink,
  },
  perkBody: {
    color: c.ink2,
    lineHeight: ms(17),
  },
}));
