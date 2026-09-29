import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import BadgeArt from '@/components/brand/BadgeArt';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import ProgressBar from '@/components/common/ProgressBar';
import SectionHeader from '@/components/common/SectionHeader';
import TextComp from '@/components/common/TextComp';
import { duration, springPop, timing } from '@/config/motion';
import type { Badge, HomeData } from '@/models/home';
import { makeStyles, useColors } from '@/styles/theme';
import { gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { badgeKeys } from '@/utils/i18nKeys';
import { lastSevenDays } from '@/utils/date';

const XP_STEP = 25;

type Props = {
  game: HomeData['gamification'];
  doneToday: boolean;
  inView: boolean;
  onBadgePress: (badge: Badge) => void;
  highlightKey?: number | null;
};

export default function RewardsCard({
  game,
  doneToday,
  inView,
  onBadgePress,
  highlightKey,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const days = lastSevenDays(i18n.language);
  const earnedBadges = game.badges.filter((b) => !b.locked).length;

  return (
    <Card highlightKey={highlightKey}>
      <SectionHeader
        title={t('rewards.streak', { count: game.streakDays })}
        leading={<Icon name="flame" size={22} color={colors.flame} />}
        trailing={
          <TextComp style={[styles.status, { color: doneToday ? colors.mint : colors.flameInk }]}>
            {doneToday ? t('rewards.todayDone') : t('rewards.practiseToExtend')}
          </TextComp>
        }
      />

      <View style={styles.week}>
        {days.map((label, index) => {
          const isToday = index === days.length - 1;
          return (
            <DayTile
              key={`${label}-${index}`}
              label={isToday ? t('rewards.today') : label}
              lit={isToday ? doneToday : true}
              isToday={isToday}
            />
          );
        })}
      </View>

      <View style={styles.stats}>
        <Stat>
          <AnimatedNumber
            value={game.xp}
            from={doneToday ? game.xp - XP_STEP : game.xp}
            run={inView}
            grouped
            style={styles.statValue}
          />
          <TextComp style={styles.statLabel}>{t('rewards.totalXp')}</TextComp>
        </Stat>
        <Stat>
          <TextComp style={styles.statValue}>{game.level}</TextComp>
          <TextComp style={styles.statLabel}>{t('rewards.level')}</TextComp>
        </Stat>
        <Stat>
          <TextComp style={styles.statValue}>{earnedBadges}</TextComp>
          <TextComp style={styles.statLabel}>{t('rewards.badges')}</TextComp>
        </Stat>
      </View>

      <View style={styles.weeklyRow}>
        <TextComp style={styles.weeklyLabel}>{t('rewards.weeklyGoal')}</TextComp>
        <View style={styles.weeklyValue}>
          <AnimatedNumber
            value={game.weeklyXp}
            from={doneToday ? game.weeklyXp - XP_STEP : 0}
            run={inView}
            style={[styles.weeklyNumber, styles.weeklyCount]}
          />
          <TextComp style={styles.weeklyNumber}>
            {' '}
            {t('rewards.weeklyValue', { goal: game.weeklyGoalXp })}
          </TextComp>
        </View>
      </View>
      <ProgressBar
        progress={game.weeklyXp / game.weeklyGoalXp}
        gradient={gradients.xpBar}
        delay={inView ? 120 : 0}
        accessibilityLabel={t('rewards.weeklyA11y', {
          current: game.weeklyXp,
          goal: game.weeklyGoalXp,
        })}
      />

      <View style={styles.badges}>
        {game.badges.map((badge) => {
          const keys = badgeKeys(badge);
          return (
            <PressableScale
              key={badge.id}
              onPress={() => onBadgePress(badge)}
              scaleTo={0.93}
              accessibilityRole="button"
              accessibilityLabel={`${t(keys.name)}. ${t(keys.earned)}`}
              style={styles.badge}
            >
              <BadgeArt badge={badge} />
              <TextComp
                style={[styles.badgeName, badge.locked ? styles.badgeNameLocked : null]}
                numberOfLines={2}
              >
                {t(keys.name)}
              </TextComp>
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
}

function DayTile({ label, lit, isToday }: { label: string; lit: boolean; isToday: boolean }) {
  const styles = useStyles();
  const colors = useColors();
  const ignite = useSharedValue(lit && isToday ? 1 : 0);

  useEffect(() => {
    if (!isToday) return;
    ignite.set(
      lit
        ? withSequence(
            withTiming(0.6, { duration: 0 }),
            withSpring(1.2, springPop),
            withSpring(1, springPop),
          )
        : withTiming(0, timing(duration.fast)),
    );
  }, [lit, isToday, ignite]);

  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: isToday && lit ? ignite.get() : 1 }],
  }));

  return (
    <View style={styles.day}>
      <Animated.View
        style={[
          styles.dayTile,
          !lit && isToday ? styles.dayToday : null,
          !lit && !isToday ? styles.dayOff : null,
          pop,
        ]}
      >
        {lit ? (
          <LinearGradient
            colors={gradients.streakDay as unknown as [string, string]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {lit ? <Icon name="flame" size={18} color={colors.onAccent} /> : null}
        {!lit && isToday ? <Icon name="flame" size={18} color={colors.flame} /> : null}
      </Animated.View>
      <TextComp style={[styles.dayLabel, isToday ? styles.dayLabelToday : null]}>{label}</TextComp>
    </View>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <View style={styles.stat}>{children}</View>;
}

const useStyles = makeStyles((c) => ({
  status: {
    fontFamily: fontFamily.black,
    fontSize: ms(13.5),
    lineHeight: ms(17.6),
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(4),
    marginBottom: spacing.lg,
  },
  day: {
    alignItems: 'center',
    gap: ms(6),
  },
  dayTile: {
    width: ms(36),
    height: ms(36),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: c.bg,
  },
  dayOff: {
    backgroundColor: c.bg,
  },
  dayToday: {
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.flame,
  },
  dayLabel: {
    fontFamily: fontFamily.black,
    fontSize: ms(11.5),
    lineHeight: ms(15),
    color: c.ink3,
  },
  dayLabelToday: {
    color: c.ink,
  },
  stats: {
    flexDirection: 'row',
    gap: ms(8),
    marginBottom: spacing.base,
  },
  stat: {
    flex: 1,
    gap: ms(1),
    paddingVertical: ms(10),
    paddingHorizontal: ms(12),
    borderRadius: radius.input,
    backgroundColor: c.bg,
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: ms(20),
    lineHeight: ms(25.6),
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(11.5),
    lineHeight: ms(15),
    color: c.ink3,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weeklyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink,
  },
  weeklyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyNumber: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(14),
    lineHeight: ms(17.9),
    color: c.ink2,
    fontVariant: ['tabular-nums'],
  },
  weeklyCount: {
    minWidth: ms(30),
    textAlign: 'right',
  },
  badges: {
    flexDirection: 'row',
    gap: ms(10),
    marginTop: spacing.lg,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    gap: ms(6),
    paddingVertical: ms(12),
    paddingHorizontal: ms(6),
    borderRadius: radius.button,
    backgroundColor: c.bg,
  },
  badgeName: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12),
    lineHeight: ms(15),
    textAlign: 'center',
    color: c.ink,
  },
  badgeNameLocked: {
    color: c.ink3,
  },
}));
