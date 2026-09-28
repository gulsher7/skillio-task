import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import Buddy from '@/components/brand/Buddy';
import CefrTag from '@/components/common/CefrTag';
import Icon from '@/components/common/Icon';
import IconTile from '@/components/common/IconTile';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { DEFAULTS } from '@/data/mock';
import { FOCUS_OPTIONS, GOALS, LEVELS, WEEKS_TO_NEXT_LEVEL } from '@/data/onboardingOptions';
import { useAppSelector } from '@/hooks/useRedux';
import { colors, gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, shadows, spacing } from '@/styles/tokens';

export default function PlanScreen() {
  const { goal, level, dailyGoal, focus, name } = useAppSelector((s) => s.onboarding);

  const chosenGoal = GOALS.find((g) => g.id === goal) ?? GOALS[0];
  const chosenLevel = LEVELS.find((l) => l.id === level) ?? LEVELS[2];
  const chosenFocus = FOCUS_OPTIONS.filter((f) => focus.includes(f.id));
  const minutes = dailyGoal ?? 10;
  const weeks = WEEKS_TO_NEXT_LEVEL[minutes];
  const displayName = name.trim() || DEFAULTS.userName;
  const focusList = chosenFocus.length ? chosenFocus : FOCUS_OPTIONS.slice(0, 2);

  const perks = [
    {
      icon: 'flame' as const,
      color: colors.flame,
      tint: colors.flame50,
      title: 'Daily streak',
      body: 'Practise each day to grow your flame.',
    },
    {
      icon: 'bolt' as const,
      color: '#E3A20B',
      tint: colors.sun50,
      title: `+${DEFAULTS.practice.xpReward} XP a day`,
      body: 'Earn XP for every practice you finish.',
    },
    {
      icon: 'target' as const,
      color: colors.teal,
      tint: colors.teal50,
      title: `${minutes}-min goal`,
      body: 'A daily target sized to your schedule.',
    },
    {
      icon: 'sparkle' as const,
      color: colors.violet,
      tint: colors.violet50,
      title: 'Lessons for you',
      body: `Built around ${focusList[0].label.toLowerCase()}${
        focusList[1] ? ` and ${focusList[1].label.toLowerCase()}` : ''
      }.`,
    },
  ];

  return (
    <OnboardingShell
      step={5}
      complete
      title={`${displayName}, here's how you'll reach ${chosenLevel.next}`}
      onContinue={() => router.push('/building')}
      ctaLabel="Start learning"
    >
      <View style={styles.stack}>
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
              <TextComp style={styles.planTopLabel}>Estimated time to {chosenLevel.next}</TextComp>
              <TextComp style={styles.planTopValue}>~{weeks} weeks</TextComp>
            </View>
          </LinearGradient>

          <Row label="Name">
            <TextComp style={styles.value}>{displayName}</TextComp>
          </Row>
          <Row label="Goal">
            <Icon name={chosenGoal.icon} size={18} color={chosenGoal.color} />
            <TextComp style={styles.value}>{chosenGoal.label}</TextComp>
          </Row>
          <Row label="Level">
            <TextComp style={styles.value}>{chosenLevel.name}</TextComp>
            <CefrTag level={chosenLevel.cefr} />
            <Icon name="chevronRight" size={14} color={colors.ink3} strokeWidth={3} />
            <CefrTag level={chosenLevel.next} filled />
          </Row>
          <Row label="Daily goal">
            <TextComp style={styles.value}>{minutes} minutes a day</TextComp>
          </Row>
          <Row label="Focus">
            {focusList.map((f) => (
              <TextComp key={f.id} style={styles.miniChip}>
                {f.label}
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
  return (
    <View style={styles.row}>
      <TextComp style={styles.rowLabel}>{label}</TextComp>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  planCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
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
    color: 'rgba(255,255,255,0.85)',
  },
  planTopValue: {
    fontFamily: fontFamily.display,
    fontSize: ms(30),
    letterSpacing: -0.8,
    color: colors.surface,
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: ms(13),
    paddingHorizontal: spacing.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowLabel: {
    width: ms(84),
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    color: colors.ink3,
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
    color: colors.ink,
  },
  miniChip: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    paddingHorizontal: ms(9),
    paddingVertical: ms(4),
    borderRadius: ms(9),
    overflow: 'hidden',
    backgroundColor: colors.teal50,
    color: colors.teal700,
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
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  perkTitle: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
    color: colors.ink,
  },
  perkBody: {
    color: colors.ink2,
    lineHeight: ms(17),
  },
});
