import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSheet } from '@/components/common/LanguagePicker';
import Sheet from '@/components/common/Sheet';
import { showToast } from '@/components/common/Toast';
import { PRESETS } from '@/components/demo/DemoPanel';
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
import { duration, enterDown, springPop, STAGGER, timing } from '@/config/motion';
import { TEACHERS } from '@/data/avatars';
import { SAMPLE_RESULT } from '@/data/mock';
import { useHomeData } from '@/hooks/useHomeData';
import { useInView } from '@/hooks/useInView';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { Badge } from '@/models/home';
import {
  activatePlan,
  applyPreset,
  bookClass,
  clearCelebration,
  topUpLessons,
  unlockSkillSnapshot,
} from '@/redux/reducers/homeSlice';
import { makeStyles } from '@/styles/theme';

import { layout, spacing } from '@/styles/tokens';
import { atDayOffset, toLocalIso } from '@/utils/date';
import { focusHomeSection, onHomeFocus, type HomeSection } from '@/utils/homeFocus';

type SheetKind =
  | { kind: 'results' }
  | { kind: 'book' }
  | { kind: 'join' }
  | { kind: 'badge'; badge: Badge }
  | { kind: 'plans' }
  | { kind: 'topup' }
  | { kind: 'language' };

/** How long after landing back from /celebrate the XP chip takes off. */
const CELEBRATION_DELAY = 450;

export default function HomeScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const data = useHomeData();
  const justCelebrated = useAppSelector((s) => s.home.justCelebrated);
  const { state: deepLinkState } = useLocalSearchParams<{ state?: string }>();
  const isFocused = usePathname() === '/home';

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

  // Deep link: skillio://home?state=noclass opens Home in that exact state, so a
  // screenshot script can walk every case without touching the UI.
  useEffect(() => {
    if (!deepLinkState) return;
    const preset = PRESETS.find((p) => p.id === deepLinkState);
    if (!preset) return;
    dispatch(applyPreset(preset.patch));
    focusHomeSection(preset.section);
  }, [deepLinkState, dispatch]);

  useEffect(
    () =>
      onHomeFocus((section, token) => {
        scrollToSection(section);
        setHighlight({ section, token });
      }),
    [scrollToSection],
  );

  // Reward feedback fires whenever today's practice flips to complete, whether
  // that came from the practice flow or from the demo panel. It waits for Home
  // to be on screen again — the celebration screen is still in front of it when
  // the practice actually finishes.
  const done = data.dailyPractice.completedToday;
  useEffect(() => {
    if (!isFocused) return;
    if (!done) {
      previousDone.current = false;
      return;
    }
    if (previousDone.current) return;
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
  }, [isFocused, done, justCelebrated, dispatch, streakPulse]);

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
                showToast(t('skills.unlocked'), 'sparkle');
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
        onBellPress={() => showToast(t('home.bellToast'), 'bell')}
        onLanguagePress={() => setSheet({ kind: 'language' })}
      />

      {/* The XP chip flies up to the streak, which sits under the greeting. */}
      {flyingXp ? (
        <XpFly
          amount={data.dailyPractice.xpReward}
          onDone={() => setFlyingXp(false)}
          style={{ top: insets.top + spacing.xxl * 2, left: spacing.xxl * 3.4 }}
        />
      ) : null}

      <TabBar onHomePress={() => scrollToSection('top')} />

      <Confetti ref={confetti} />

      {sheet?.kind === 'language' ? (
        <Sheet onClose={closeSheet} label={t('common.language')}>
          {(close) => <LanguageSheet onDone={close} />}
        </Sheet>
      ) : null}

      {sheet?.kind === 'results' ? (
        <Sheet onClose={closeSheet} label={t('sheets.resultsEyebrow')} scrollable>
          <ResultsSheet
            result={data.dailyPractice.result ?? SAMPLE_RESULT}
            xpReward={data.dailyPractice.xpReward}
          />
        </Sheet>
      ) : null}

      {sheet?.kind === 'book' ? (
        <Sheet onClose={closeSheet} label={t('sheets.bookTitle')}>
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
                showToast(
                  t('sheets.bookedToast', { name: teacher.name.split(' ')[0] }),
                  'calendar',
                );
              }}
            />
          )}
        </Sheet>
      ) : null}

      {sheet?.kind === 'join' && data.scheduledClass ? (
        <Sheet onClose={closeSheet} label={t('class.join')}>
          {(close) => (
            <JoinClassSheet
              scheduledClass={data.scheduledClass!}
              onEnter={() => {
                close();
                showToast(t('sheets.videoToast'), 'video');
              }}
            />
          )}
        </Sheet>
      ) : null}

      {sheet?.kind === 'badge' ? (
        <Sheet onClose={closeSheet} label={t('rewards.badges')}>
          <BadgeSheet badge={sheet.badge} />
        </Sheet>
      ) : null}

      {sheet?.kind === 'plans' || sheet?.kind === 'topup' ? (
        <Sheet onClose={closeSheet} label={t('sheets.choosePlan')} scrollable>
          {(close) => (
            <PlansSheet
              mode={sheet.kind === 'topup' ? 'topup' : 'plans'}
              onChoose={(lessons) => {
                const topUp = sheet.kind === 'topup';
                close();
                dispatch(topUp ? topUpLessons(lessons) : activatePlan(lessons));
                showToast(
                  topUp
                    ? t('sheets.lessonsAdded', { count: lessons })
                    : t('sheets.welcomeToPremium'),
                  'crown',
                );
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
      entering={enterDown(index * STAGGER)}
      onLayout={(event) => {
        onMeasure(section, event.nativeEvent.layout.y);
        onLayout(event);
      }}
    >
      {children(inView)}
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  content: {
    paddingHorizontal: spacing.homeGutter,
    paddingBottom: layout.scrollBottomPad,
    gap: spacing.section,
  },
}));
