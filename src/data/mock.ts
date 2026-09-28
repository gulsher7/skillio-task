import type { Badge, PracticeResult, SkillKey } from '@/models/home';
import { colors } from '@/styles/colors';
import { atDayOffset, toLocalIso } from '@/utils/date';

import type { TeacherId } from './avatars';

export const BADGES: Badge[] = [
  {
    id: 'streak',
    name: 'Week Warrior',
    description: 'Practised 7 days in a row. Keep the flame going.',
    earnedLabel: 'Earned today',
    glyph: 'flame',
    colors: ['#FFA25E', '#FF6A3D'],
  },
  {
    id: 'words',
    name: 'Word Collector',
    description: 'Learned your first 300 words.',
    earnedLabel: 'Earned Sep 21',
    glyph: 'book',
    colors: ['#FFD36A', '#F29A1F'],
  },
  {
    id: 'voice',
    name: 'Clear Voice',
    description: 'Score 80%+ in pronunciation. You are 9% away.',
    earnedLabel: 'Locked',
    locked: true,
    glyph: 'mic',
    colors: ['#9C90FF', '#6A5AE8'],
  },
];

export type ClassSlot = {
  id: string;
  dayOffset: number;
  hour: number;
  minute: number;
  teacher: TeacherId;
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

export const SKILL_META: Record<
  SkillKey,
  {
    label: string;
    color: string;
    tint: string;
    icon: 'puzzle' | 'book' | 'wave' | 'mic';
    tip: string;
  }
> = {
  grammar: {
    label: 'Grammar',
    color: colors.skill.grammar,
    tint: colors.skillTint.grammar,
    icon: 'puzzle',
    tip: 'Strongest skill. Conditionals are next up.',
  },
  vocabulary: {
    label: 'Vocabulary',
    color: colors.skill.vocabulary,
    tint: colors.skillTint.vocabulary,
    icon: 'book',
    tip: '312 words learned. 18 are due for review.',
  },
  pronunciation: {
    label: 'Pronunciation',
    color: colors.skill.pronunciation,
    tint: colors.skillTint.pronunciation,
    icon: 'wave',
    tip: 'Word stress improved 9% this month.',
  },
  speaking: {
    label: 'Speaking',
    color: colors.skill.speaking,
    tint: colors.skillTint.speaking,
    icon: 'mic',
    tip: 'Your focus area. 2 speaking drills this week.',
  },
};

export const SKILL_ORDER: SkillKey[] = ['grammar', 'vocabulary', 'pronunciation', 'speaking'];

export const DEFAULTS = {
  userName: 'Alex',
  tier: 'Premium',
  lessonsRemaining: 24,
  totalLessons: 40,
  renewsOn: 'Oct 28',
  overallProgressPercent: 68,
  weeksToNextLevel: '~6 weeks to go',
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
  {
    id: 'plus',
    name: 'Plus · 20 lessons / month',
    price: '$59/mo',
    lessons: 20,
    note: 'Good to start',
  },
  {
    id: 'premium',
    name: 'Premium · 40 lessons / month',
    price: '$99/mo',
    lessons: 40,
    note: 'Best value',
  },
];

export const TOPUP_OPTIONS = [
  { id: 'ten', name: '10 lessons', price: '$39', lessons: 10, note: 'Good to start' },
  { id: 'twenty', name: '20 lessons', price: '$69', lessons: 20, note: 'Best value' },
];
