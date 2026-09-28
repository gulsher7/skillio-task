import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_CLASS, DEFAULTS, SAMPLE_RESULT } from '@/data/mock';
import type { PracticeResult, ScheduledClass } from '@/models/home';

export type SubscriptionState = 'active' | 'empty' | 'none';

/**
 * Everything Home reads that a real backend would own. The demo panel writes to
 * the same place the app's own actions do, so switching a state and living
 * through it produce identical UI.
 */
type HomeState = {
  hasClass: boolean;
  scheduledClass: ScheduledClass;
  practiceDone: boolean;
  result: PracticeResult;
  hasSkillData: boolean;
  subscription: SubscriptionState;
  lessonsRemaining: number;
  /** Set on the way back from /celebrate so Home knows to play the XP flight. */
  justCelebrated: boolean;
};

const initialState: HomeState = {
  hasClass: true,
  scheduledClass: DEFAULT_CLASS,
  practiceDone: false,
  result: SAMPLE_RESULT,
  hasSkillData: true,
  subscription: 'active',
  lessonsRemaining: DEFAULTS.lessonsRemaining,
  justCelebrated: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    bookClass: (state, { payload }: PayloadAction<ScheduledClass>) => {
      state.scheduledClass = payload;
      state.hasClass = true;
      state.lessonsRemaining = Math.max(0, state.lessonsRemaining - 1);
      if (state.lessonsRemaining > 0) state.subscription = 'active';
    },
    completePractice: (state, { payload }: PayloadAction<PracticeResult>) => {
      state.practiceDone = true;
      state.result = payload;
      state.justCelebrated = true;
    },
    clearCelebration: (state) => {
      state.justCelebrated = false;
    },
    unlockSkillSnapshot: (state) => {
      state.hasSkillData = true;
    },
    activatePlan: (state, { payload }: PayloadAction<number>) => {
      state.subscription = 'active';
      state.lessonsRemaining = payload;
    },
    topUpLessons: (state, { payload }: PayloadAction<number>) => {
      state.subscription = 'active';
      state.lessonsRemaining = payload;
    },

    // --- demo panel ---
    setHasClass: (state, { payload }: PayloadAction<boolean>) => {
      state.hasClass = payload;
    },
    setPracticeDone: (state, { payload }: PayloadAction<boolean>) => {
      state.practiceDone = payload;
      state.justCelebrated = false;
    },
    setHasSkillData: (state, { payload }: PayloadAction<boolean>) => {
      state.hasSkillData = payload;
    },
    setSubscription: (state, { payload }: PayloadAction<SubscriptionState>) => {
      state.subscription = payload;
      if (payload === 'active') state.lessonsRemaining = DEFAULTS.lessonsRemaining;
      if (payload !== 'active') state.lessonsRemaining = 0;
    },
    applyPreset: (state, { payload }: PayloadAction<Partial<HomeState>>) => {
      Object.assign(state, initialState, payload);
    },
  },
});

export const {
  bookClass,
  completePractice,
  clearCelebration,
  unlockSkillSnapshot,
  activatePlan,
  topUpLessons,
  setHasClass,
  setPracticeDone,
  setHasSkillData,
  setSubscription,
  applyPreset,
} = homeSlice.actions;

export default homeSlice.reducer;
