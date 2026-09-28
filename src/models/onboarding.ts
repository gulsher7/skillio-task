import type { Cefr, SkillKey } from './home';

export type GoalId = 'speak' | 'vocab' | 'grammar' | 'pron' | 'exam' | 'work';
export type LevelId = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';
export type FocusId = SkillKey | 'listening';

export type IconName = 'mic' | 'book' | 'puzzle' | 'wave' | 'cap' | 'briefcase' | 'headphones';

export type GoalOption = {
  id: GoalId;
  label: string;
  sub: string;
  icon: IconName;
  color: string;
  tint: string;
};

export type LevelOption = {
  id: LevelId;
  name: string;
  cefr: Cefr;
  next: Cefr;
  description: string;
};

export type DailyOption = {
  minutes: number;
  label: string;
  popular?: boolean;
};

export type FocusOption = {
  id: FocusId;
  label: string;
  icon: IconName;
  color: string;
  tint: string;
};
