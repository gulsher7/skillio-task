import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Sheet from '@/components/common/Sheet';
import { showToast } from '@/components/common/Toast';
import Confetti, { type ConfettiHandle } from '@/components/fx/Confetti';
import XpFly from '@/components/fx/XpFly';
import ClassCard from '@/components/home/ClassCard';
import HomeHeader from '@/components/home/HomeHeader';
import JourneyCard from '@/components/home/JourneyCard';
import PlanCard from '@/components/home/PlanCard';
import PracticeHero from '@/components/home/PracticeHero';
import RewardsCard from '@/components/home/RewardsCard';
import SkillSnapshot from '@/components/home/SkillSnapshot';
import TabBar from '@/components/home/TabBar';
import BadgeSheet from '@/components/sheets/BadgeSheet';
import BookClassSheet from '@/components/sheets/BookClassSheet';
import JoinClassSheet from '@/components/sheets/JoinClassSheet';
import PlansSheet from '@/components/sheets/PlansSheet';
import ResultsSheet from '@/components/sheets/ResultsSheet';
import { duration, springPop, STAGGER, timing } from '@/config/motion';
import { TEACHERS } from '@/data/avatars';
import { SAMPLE_RESULT } from '@/data/mock';
import { useHomeData } from '@/hooks/useHomeData';
import { useInView } from '@/hooks/useInView';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { Badge } from '@/models/home';
import {
  activatePlan,
  bookClass,
  clearCelebration,
  topUpLessons,
  unlockSkillSnapshot,
} from '@/redux/reducers/homeSlice';
import { colors } from '@/styles/colors';
import { layout, spacing } from '@/styles/tokens';
import { atDayOffset, toLocalIso } from '@/utils/date';
import { onHomeFocus, type HomeSection } from '@/utils/homeFocus';

type SheetKind =
  | { kind: 'results' }
  | { kind: 'book' }
  | { kind: 'join' }
  | { kind: 'badge'; badge: Badge }
  | { kind: 'plans' }
  | { kind: 'topup' };

/** How long after landing back from /celebrate the XP chip takes off. */
const CELEBRATION_DELAY = 450;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const data = useHomeData();
  const justCelebrated = useAppSelector((s) => s.home.justCelebrated);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const sectionY = useRef<Partial<Record<HomeSection, number>>>({});
  const confetti = useRef<ConfettiHandle>(null);
  const previousDone = useRef(data.dailyPractice.completedToday);

  const scrollY = useSharedValue(0);
  const streakPulse = useSharedValue(0);

  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [highlight, setHighlight] = useState<{ section: HomeSection; token: number } | null>(null);
  const [flyingXp, setFlyingXp] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(insets.top + spacing.xxl * 3);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const scrollToSection = useCallback((section: HomeSection) => {
    const y = section === 'top' ? 0 : (sectionY.current[section] ?? 0) - spacing.xl;
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  }, []);

  useEffect(
    () =>
      onHomeFocus((section, token) => {
        scrollToSection(section);
        setHighlight({ section, token });
      }),
    [scrollToSection],
  );

  // Reward feedback fires whenever today's practice flips to complete, whether
  // that came from the practice flow or from the demo panel.
  const done = data.dailyPractice.completedToday;
  useEffect(() => {
    if (!done || previousDone.current) {
      previousDone.current = done;
      return;
    }
    previousDone.current = true;

    const fromCelebration = justCelebrated;
    if (fromCelebration) dispatch(clearCelebration());

    const timer = setTimeout(
      () => {
        setFlyingXp(true);
        streakPulse.set(
          withSequence(withSpring(1, springPop), withTiming(0, timing(duration.base))),
        );
        // The celebration screen already threw confetti; don't repeat it.
        if (!fromCelebration) confetti.current?.fire({ y: 0.22, count: 120 });
      },
      fromCelebration ? CELEBRATION_DELAY : 150,
    );

    return () => clearTimeout(timer);
  }, [done, justCelebrated, dispatch, streakPulse]);

  const measure = useCallback((section: HomeSection, y: number) => {
    sectionY.current[section] = y;
  }, []);

  const highlightFor = (section: HomeSection) =>
    highlight?.section === section ? highlight.token : null;

  const closeSheet = () => setSheet(null);

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.sm }]}
      >
        <Section index={0} section="top" scrollY={scrollY} onMeasure={measure}>
          {() => (
            <PracticeHero
              practice={data.dailyPractice}
              name={data.user.name}
              onStart={() => router.push('/practice')}
              onViewResults={() => setSheet({ kind: 'results' })}
            />
          )}
        </Section>

        <Section index={1} section="class" scrollY={scrollY} onMeasure={measure}>
          {() => (
            <ClassCard
              scheduledClass={data.scheduledClass}
              subscription={data.subscription}
              highlightKey={highlightFor('class')}
              onJoin={() => setSheet({ kind: 'join' })}
              onBook={() => setSheet({ kind: 'book' })}
            />
          )}
        </Section>

        <Section index={2} section="progress" scrollY={scrollY} onMeasure={measure}>
          {(inView) => (
            <JourneyCard
              progress={data.progress}
              avatarUrl={data.user.avatarUrl}
              name={data.user.name}
              inView={inView}
              highlightKey={highlightFor('progress')}
            />
          )}
        </Section>

        <Section index={3} section="skills" scrollY={scrollY} onMeasure={measure}>
          {(inView) => (
            <SkillSnapshot
              skills={data.skillSnapshot}
              inView={inView}
              highlightKey={highlightFor('skills')}
              onUnlock={() => {
                dispatch(unlockSkillSnapshot());
                showToast('Skill snapshot unlocked', 'sparkle');
              }}
            />
          )}
        </Section>

        <Section index={4} section="rewards" scrollY={scrollY} onMeasure={measure}>
          {(inView) => (
            <RewardsCard
              game={data.gamification}
              doneToday={done}
              inView={inView}
              highlightKey={highlightFor('rewards')}
              onBadgePress={(badge) => setSheet({ kind: 'badge', badge })}
            />
          )}
        </Section>

        <Section index={5} section="plan" scrollY={scrollY} onMeasure={measure}>
          {(inView) => (
            <PlanCard
              subscription={data.subscription}
              inView={inView}
              highlightKey={highlightFor('plan')}
              onManage={() => setSheet({ kind: 'plans' })}
              onTopUp={() => setSheet({ kind: 'topup' })}
              onSeePlans={() => setSheet({ kind: 'plans' })}
            />
          )}
        </Section>
      </Animated.ScrollView>

      <HomeHeader
        name={data.user.name}
        avatarUrl={data.user.avatarUrl}
        level={data.gamification.level}
        streakDays={data.gamification.streakDays}
        scrollY={scrollY}
        streakPulse={streakPulse}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
        onStreakPress={() => scrollToSection('rewards')}
        onBellPress={() => showToast('Sarah shared notes from your last class', 'bell')}
      />

      {flyingXp ? (
        <XpFly
          amount={data.dailyPractice.xpReward}
          onDone={() => setFlyingXp(false)}
          style={{ top: insets.top + spacing.xxl, right: spacing.xxl * 3 }}
        />
      ) : null}

      <TabBar onHomePress={() => scrollToSection('top')} />

      <Confetti ref={confetti} />

      {sheet?.kind === 'results' ? (
        <Sheet onClose={closeSheet} label="Practice results" scrollable>
          <ResultsSheet
            result={data.dailyPractice.result ?? SAMPLE_RESULT}
            xpReward={data.dailyPractice.xpReward}
          />
        </Sheet>
      ) : null}

      {sheet?.kind === 'book' ? (
        <Sheet onClose={closeSheet} label="Book a class">
          {(close) => (
            <BookClassSheet
              subscription={data.subscription}
              onClose={close}
              onSeePlans={() => setSheet({ kind: 'plans' })}
              onTopUp={() => setSheet({ kind: 'topup' })}
              onBooked={(slot) => {
                const at = atDayOffset(slot.dayOffset, slot.hour, slot.minute);
                const teacher = TEACHERS[slot.teacher];
                dispatch(
                  bookClass({
                    time: toLocalIso(at),
                    teacher: teacher.name,
                    subject: slot.subject,
                  }),
                );
                showToast(`Booked with ${teacher.name.split(' ')[0]} · 1 lesson used`, 'calendar');
              }}
            />
          )}
        </Sheet>
      ) : null}

      {sheet?.kind === 'join' && data.scheduledClass ? (
        <Sheet onClose={closeSheet} label="Join class">
          {(close) => (
            <JoinClassSheet
              scheduledClass={data.scheduledClass!}
              onEnter={() => {
                close();
                showToast('The video room opens here in the full app', 'video');
              }}
            />
          )}
        </Sheet>
      ) : null}

      {sheet?.kind === 'badge' ? (
        <Sheet onClose={closeSheet} label={sheet.badge.name}>
          <BadgeSheet badge={sheet.badge} />
        </Sheet>
      ) : null}

      {sheet?.kind === 'plans' || sheet?.kind === 'topup' ? (
        <Sheet onClose={closeSheet} label="Plans" scrollable>
          {(close) => (
            <PlansSheet
              mode={sheet.kind === 'topup' ? 'topup' : 'plans'}
              onChoose={(lessons) => {
                const topUp = sheet.kind === 'topup';
                close();
                dispatch(topUp ? topUpLessons(lessons) : activatePlan(lessons));
                showToast(topUp ? `${lessons} lessons added` : 'Welcome to Premium', 'crown');
              }}
            />
          )}
        </Sheet>
      ) : null}
    </View>
  );
}

function Section({
  index,
  section,
  scrollY,
  onMeasure,
  children,
}: {
  index: number;
  section: HomeSection;
  scrollY: SharedValue<number>;
  onMeasure: (section: HomeSection, y: number) => void;
  children: (inView: boolean) => React.ReactNode;
}) {
  const { onLayout, inView } = useInView(scrollY);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * STAGGER)
        .springify()
        .damping(18)}
      onLayout={(event) => {
        onMeasure(section, event.nativeEvent.layout.y);
        onLayout(event);
      }}
    >
      {children(inView)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.homeGutter,
    paddingBottom: layout.scrollBottomPad,
    gap: spacing.section,
  },
});
