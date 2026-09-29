import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { STUDENT_AVATAR } from '@/data/avatars';
import { BADGES, DEFAULTS } from '@/data/mock';
import { FOCUS_OPTIONS, LEVELS } from '@/data/onboardingOptions';
import type { HomeData } from '@/models/home';
import { topicKey } from '@/utils/i18nKeys';
import { useAppSelector } from './useRedux';

const XP_PER_PRACTICE = DEFAULTS.practice.xpReward;

/**
 * The single place the Home payload is assembled. Screens read this and never
 * touch the stores directly, so swapping in a real API later is one file.
 */
export function useHomeData(): HomeData {
  const { t, i18n } = useTranslation();
  const onboarding = useAppSelector((s) => s.onboarding);
  const home = useAppSelector((s) => s.home);

  return useMemo(() => {
    const level = LEVELS.find((l) => l.id === onboarding.level) ?? LEVELS[2];
    const focus = FOCUS_OPTIONS.find((f) => f.id === onboarding.focus[0]) ?? FOCUS_OPTIONS[0];
    const done = home.practiceDone;

    const noPlan = home.subscription === 'none';
    const skills = home.hasSkillData ? DEFAULTS.skills : null;
    // The coach writes an absolute score, so a session that ran before there
    // was any skill data sets the baseline instead of adding to a default.
    const pronunciation = skills ? (home.pronunciationLevel ?? skills.pronunciation) : null;

    return {
      user: {
        name: onboarding.name.trim() || DEFAULTS.userName,
        avatarUrl: STUDENT_AVATAR,
      },
      subscription: noPlan
        ? { tier: null, lessonsRemaining: 0, totalLessons: 0 }
        : {
            tier: DEFAULTS.tier,
            lessonsRemaining: home.subscription === 'empty' ? 0 : home.lessonsRemaining,
            totalLessons: DEFAULTS.totalLessons,
          },
      scheduledClass: home.hasClass ? home.scheduledClass : null,
      progress: {
        currentCefrLevel: level.cefr,
        nextCefrLevel: level.next,
        overallProgressPercent: DEFAULTS.overallProgressPercent,
      },
      skillSnapshot: {
        grammar: skills?.grammar ?? null,
        vocabulary: skills?.vocabulary ?? null,
        pronunciation,
        speaking: skills?.speaking ?? null,
        overallImprovementPercent: skills?.overallImprovementPercent ?? null,
        growthPercent: skills?.growthPercent ?? null,
      },
      dailyPractice: {
        completedToday: done,
        topic: t(topicKey(focus.id)),
        focusLabel: t(`focus.${focus.id}`),
        questionCount: DEFAULTS.practice.questionCount,
        estimatedMinutes: DEFAULTS.practice.estimatedMinutes,
        xpReward: XP_PER_PRACTICE,
        result: done ? home.result : null,
      },
      gamification: {
        streakDays: DEFAULTS.game.streakDays + (done ? 1 : 0),
        xp: DEFAULTS.game.xp + (done ? XP_PER_PRACTICE : 0),
        level: DEFAULTS.game.level,
        weeklyXp: DEFAULTS.game.weeklyXp + (done ? XP_PER_PRACTICE : 0),
        weeklyGoalXp: DEFAULTS.game.weeklyGoalXp,
        badges: BADGES,
      },
    };
    // i18n.language keeps the payload in sync when the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding, home, t, i18n.language]);
}
