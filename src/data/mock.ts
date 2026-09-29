import type { Badge, PracticeResult, SkillKey } from '@/models/home';
import { atDayOffset, toLocalIso } from '@/utils/date';

import type { TeacherId } from './avatars';

export const BADGES: Badge[] = [
  { id: 'streak', glyph: 'flame', colors: ['#FFA25E', '#FF6A3D'] },
  { id: 'words', glyph: 'book', colors: ['#FFD36A', '#F29A1F'] },
  { id: 'voice', glyph: 'mic', colors: ['#9C90FF', '#6A5AE8'], locked: true },
];

export type ClassSlot = {
  id: string;
  dayOffset: number;
  hour: number;
  minute: number;
  teacher: TeacherId;
  /** Teacher names and subjects are backend records, so they stay as sent. */
  subject: string;
};

export const CLASS_SLOTS: ClassSlot[] = [
  {
    id: 's1',
    dayOffset: 0,
    hour: 19,
    minute: 30,
    teacher: 'sarah',
    subject: 'English Conversation',
  },
  { id: 's2', dayOffset: 1, hour: 17, minute: 0, teacher: 'james', subject: 'Grammar Clinic' },
  { id: 's3', dayOffset: 2, hour: 18, minute: 0, teacher: 'priya', subject: 'Pronunciation Lab' },
];

export const DEFAULT_CLASS = {
  time: toLocalIso(atDayOffset(0, 18, 30)),
  teacher: 'Sarah Williams',
  subject: 'English Conversation',
};

/** Shown when Home opens straight into the "practice done" state. */
export const SAMPLE_RESULT: PracticeResult = {
  correct: 9,
  total: 10,
  seconds: 462,
  accuracy: 90,
  bySkill: { grammar: [3, 3], vocabulary: [3, 3], speaking: [2, 2], pronunciation: [1, 2] },
  missed: ['pho-TOG-ra-pher'],
};

/** Colours live in the palette under `skill` / `skillTint`, keyed the same. */
export const SKILL_ICON: Record<SkillKey, 'puzzle' | 'book' | 'wave' | 'mic'> = {
  grammar: 'puzzle',
  vocabulary: 'book',
  pronunciation: 'wave',
  speaking: 'mic',
};

export const SKILL_ORDER: SkillKey[] = ['grammar', 'vocabulary', 'pronunciation', 'speaking'];

export const DEFAULTS = {
  userName: 'Alex',
  tier: 'Premium',
  lessonsRemaining: 24,
  totalLessons: 40,
  renewsOn: 'Oct 28',
  overallProgressPercent: 68,
  weeksToNextLevel: 6,
  skills: {
    grammar: 78,
    vocabulary: 64,
    pronunciation: 71,
    speaking: 58,
    overallImprovementPercent: 12,
    growthPercent: 18,
  },
  practice: { questionCount: 10, estimatedMinutes: 8, xpReward: 25 },
  game: { streakDays: 7, xp: 1240, level: 12, weeklyXp: 420, weeklyGoalXp: 500 },
} as const;

export const PLAN_OPTIONS = [
  { id: 'plus', nameKey: 'sheets.planPlus', price: '$59/mo', lessons: 20 },
  { id: 'premium', nameKey: 'sheets.planPremium', price: '$99/mo', lessons: 40 },
];

export const TOPUP_OPTIONS = [
  { id: 'ten', nameKey: 'sheets.topUpTen', price: '$39', lessons: 10 },
  { id: 'twenty', nameKey: 'sheets.topUpTwenty', price: '$69', lessons: 20 },
];
