import { create } from 'zustand';
import { CefrLevel, DailyGoalMinutes, LearningGoal, NativeLanguage } from '@englishflow/shared-types';

interface OnboardingState {
  firstName: string;
  lastName: string;
  nativeLanguage: NativeLanguage;
  level: CefrLevel | null;
  learningGoal: LearningGoal | null;
  dailyGoal: DailyGoalMinutes;
  notificationsEnabled: boolean;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setNativeLanguage: (lang: NativeLanguage) => void;
  setLevel: (level: CefrLevel) => void;
  setLearningGoal: (goal: LearningGoal) => void;
  setDailyGoal: (minutes: DailyGoalMinutes) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  firstName: '',
  lastName: '',
  nativeLanguage: NativeLanguage.FR,
  level: null,
  learningGoal: null,
  dailyGoal: DailyGoalMinutes.TEN,
  notificationsEnabled: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...DEFAULT_STATE,
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setNativeLanguage: (nativeLanguage) => set({ nativeLanguage }),
  setLevel: (level) => set({ level }),
  setLearningGoal: (learningGoal) => set({ learningGoal }),
  setDailyGoal: (dailyGoal) => set({ dailyGoal }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  reset: () => set(DEFAULT_STATE),
}));
