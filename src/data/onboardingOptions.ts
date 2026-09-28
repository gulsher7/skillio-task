import type { DailyOption, FocusOption, GoalOption, LevelOption } from '@/models/onboarding';
import { colors } from '@/styles/colors';

export const GOALS: GoalOption[] = [
  {
    id: 'speak',
    label: 'Speak English confidently',
    sub: 'Hold real conversations without freezing',
    icon: 'mic',
    color: colors.teal,
    tint: '#E3F6F8',
  },
  {
    id: 'vocab',
    label: 'Improve vocabulary',
    sub: 'Learn words you will actually use',
    icon: 'book',
    color: '#D98309',
    tint: '#FEF1DC',
  },
  {
    id: 'grammar',
    label: 'Improve grammar',
    sub: 'Build sentences that sound right',
    icon: 'puzzle',
    color: '#6A5AE8',
    tint: colors.violet50,
  },
  {
    id: 'pron',
    label: 'Improve pronunciation',
    sub: 'Sound clear and natural',
    icon: 'wave',
    color: '#E0426A',
    tint: colors.berry50,
  },
  {
    id: 'exam',
    label: 'Prepare for an exam',
    sub: 'IELTS, TOEFL, Cambridge and school tests',
    icon: 'cap',
    color: colors.ink,
    tint: '#E6EEF0',
  },
  {
    id: 'work',
    label: 'Improve English for work',
    sub: 'Meetings, emails and interviews',
    icon: 'briefcase',
    color: '#1E9E70',
    tint: colors.mint50,
  },
];

export const LEVELS: LevelOption[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    cefr: 'A1',
    next: 'A2',
    description: 'I know a few words and simple phrases',
  },
  {
    id: 'elementary',
    name: 'Elementary',
    cefr: 'A2',
    next: 'B1',
    description: 'I can handle short, everyday conversations',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    cefr: 'B1',
    next: 'B2',
    description: 'I can talk about familiar topics with some effort',
  },
  {
    id: 'upper',
    name: 'Upper Intermediate',
    cefr: 'B2',
    next: 'C1',
    description: 'I can discuss most topics fairly fluently',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    cefr: 'C1',
    next: 'C2',
    description: 'I can express complex ideas with ease',
  },
];

export const DAILY_OPTIONS: DailyOption[] = [
  { minutes: 5, label: 'Casual' },
  { minutes: 10, label: 'Regular', popular: true },
  { minutes: 15, label: 'Serious' },
  { minutes: 20, label: 'Intense' },
];

export const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'speaking', label: 'Speaking', icon: 'mic', color: colors.teal, tint: '#E3F6F8' },
  { id: 'vocabulary', label: 'Vocabulary', icon: 'book', color: '#D98309', tint: '#FEF1DC' },
  { id: 'grammar', label: 'Grammar', icon: 'puzzle', color: '#6A5AE8', tint: colors.violet50 },
  {
    id: 'listening',
    label: 'Listening',
    icon: 'headphones',
    color: '#1E9E70',
    tint: colors.mint50,
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    icon: 'wave',
    color: '#E0426A',
    tint: colors.berry50,
  },
];

/** Weeks to the next CEFR level, by daily minutes. */
export const WEEKS_TO_NEXT_LEVEL: Record<number, number> = { 5: 24, 10: 16, 15: 12, 20: 9 };

/** The first focus a student picks decides what today's practice is about. */
export const TOPIC_BY_FOCUS: Record<string, string> = {
  speaking: 'Small talk that flows',
  vocabulary: 'Words for travel days',
  grammar: 'Present perfect in action',
  listening: 'Catch the key details',
  pronunciation: 'Stress the right syllable',
};
