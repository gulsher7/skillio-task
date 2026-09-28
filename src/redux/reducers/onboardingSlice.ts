import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { FocusId, GoalId, LevelId } from '@/models/onboarding';

type OnboardingState = {
  goal: GoalId | null;
  level: LevelId | null;
  dailyGoal: number | null;
  focus: FocusId[];
  name: string;
};

const initialState: OnboardingState = {
  goal: null,
  level: null,
  dailyGoal: null,
  focus: [],
  name: '',
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setGoal: (state, { payload }: PayloadAction<GoalId>) => {
      state.goal = payload;
    },
    setLevel: (state, { payload }: PayloadAction<LevelId>) => {
      state.level = payload;
    },
    setDailyGoal: (state, { payload }: PayloadAction<number>) => {
      state.dailyGoal = payload;
    },
    toggleFocus: (state, { payload }: PayloadAction<FocusId>) => {
      state.focus = state.focus.includes(payload)
        ? state.focus.filter((id) => id !== payload)
        : [...state.focus, payload];
    },
    setName: (state, { payload }: PayloadAction<string>) => {
      state.name = payload;
    },
    resetOnboarding: () => initialState,
  },
});

export const { setGoal, setLevel, setDailyGoal, toggleFocus, setName, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
