import type { HueName } from '@/styles/palette';

import type { Cefr, SkillKey } from './home';

export type GoalId = 'speak' | 'vocab' | 'grammar' | 'pron' | 'exam' | 'work';
export type LevelId = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';
export type FocusId = SkillKey | 'listening';
export type DailyId = 'casual' | 'regular' | 'serious' | 'intense';

export type IconName = 'mic' | 'book' | 'puzzle' | 'wave' | 'cap' | 'briefcase' | 'headphones';

export type GoalOption = {
  id: GoalId;
  icon: IconName;
  hue: HueName;
};

export type LevelOption = {
  id: LevelId;
  cefr: Cefr;
  next: Cefr;
};

export type DailyOption = {
  id: DailyId;
  minutes: number;
  popular?: boolean;
};

export type FocusOption = {
  id: FocusId;
  icon: IconName;
  hue: HueName;
};
