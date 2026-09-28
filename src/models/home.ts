export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillKey = 'grammar' | 'vocabulary' | 'pronunciation' | 'speaking';

export type PracticeResult = {
  correct: number;
  total: number;
  seconds: number;
  accuracy: number;
  /** [correct, asked] per skill, only for skills that came up */
  bySkill: Partial<Record<SkillKey, [number, number]>>;
  missed: string[];
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  earnedLabel: string;
  locked?: boolean;
  glyph: 'flame' | 'book' | 'mic';
  colors: [string, string];
};

export type ScheduledClass = {
  /** ISO local time, e.g. 2026-09-28T18:30:00 */
  time: string;
  teacher: string;
  subject: string;
};

/**
 * The payload the backend sends for Home. Everything above the `added:` comments
 * is the contract from the brief, verbatim. See README for why the rest exists.
 */
export type HomeData = {
  user: { name: string; avatarUrl: string };
  subscription: { tier: string | null; lessonsRemaining: number; totalLessons: number };
  scheduledClass: ScheduledClass | null;
  progress: {
    currentCefrLevel: Cefr;
    nextCefrLevel: Cefr;
    overallProgressPercent: number;
  };
  skillSnapshot: {
    grammar: number | null;
    vocabulary: number | null;
    pronunciation: number | null;
    speaking: number | null;
    overallImprovementPercent: number | null;
    growthPercent: number | null;
  };
  dailyPractice: {
    completedToday: boolean;
    // added:
    topic: string;
    focusLabel: string;
    questionCount: number;
    estimatedMinutes: number;
    xpReward: number;
    result: PracticeResult | null;
  };
  // added:
  gamification: {
    streakDays: number;
    xp: number;
    level: number;
    weeklyXp: number;
    weeklyGoalXp: number;
    badges: Badge[];
  };
};
