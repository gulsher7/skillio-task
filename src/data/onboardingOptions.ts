import type { DailyOption, FocusOption, GoalOption, LevelOption } from '@/models/onboarding';

/**
 * Options carry ids, icons and a hue name only — strings live in `src/lang` and
 * the actual colours come from the active palette, so both translation and
 * theming happen without touching this file.
 */
export const GOALS: GoalOption[] = [
  { id: 'speak', icon: 'mic', hue: 'teal' },
  { id: 'vocab', icon: 'book', hue: 'amber' },
  { id: 'grammar', icon: 'puzzle', hue: 'violet' },
  { id: 'pron', icon: 'wave', hue: 'berry' },
  { id: 'exam', icon: 'cap', hue: 'ink' },
  { id: 'work', icon: 'briefcase', hue: 'mint' },
];

export const LEVELS: LevelOption[] = [
  { id: 'beginner', cefr: 'A1', next: 'A2' },
  { id: 'elementary', cefr: 'A2', next: 'B1' },
  { id: 'intermediate', cefr: 'B1', next: 'B2' },
  { id: 'upper', cefr: 'B2', next: 'C1' },
  { id: 'advanced', cefr: 'C1', next: 'C2' },
];

export const DAILY_OPTIONS: DailyOption[] = [
  { minutes: 5, id: 'casual' },
  { minutes: 10, id: 'regular', popular: true },
  { minutes: 15, id: 'serious' },
  { minutes: 20, id: 'intense' },
];

export const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'speaking', icon: 'mic', hue: 'teal' },
  { id: 'vocabulary', icon: 'book', hue: 'amber' },
  { id: 'grammar', icon: 'puzzle', hue: 'violet' },
  { id: 'listening', icon: 'headphones', hue: 'mint' },
  { id: 'pronunciation', icon: 'wave', hue: 'berry' },
];

/** Weeks to the next CEFR level, by daily minutes. */
export const WEEKS_TO_NEXT_LEVEL: Record<number, number> = { 5: 24, 10: 16, 15: 12, 20: 9 };

/** How long a level takes at this pace — the reason the projection lands. */
export const MONTHS_PER_LEVEL = (minutes: number) => (minutes >= 15 ? 5 : minutes >= 10 ? 7 : 10);
