import { create } from 'zustand';
import { CefrLevel, DailyGoalMinutes, LearningGoal, NativeLanguage } from '@englishflow/shared-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
  firstName: string;
  lastName: string;
  nativeLanguage: NativeLanguage;
  level: CefrLevel;
  learningGoal: LearningGoal;
  dailyGoal: DailyGoalMinutes;
  streak: number;
  xp: number;
}

interface ProfileState {
  profile: Profile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  setProfile: (profile: Profile) => void;
  loadProfile: () => Promise<void>;
  incrementStreak: () => void;
  addXp: (amount: number) => void;
}

const STORAGE_KEY = '@englishflow/profile';

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isOnboarded: false,
  isLoading: true,

  setProfile: async (profile) => {
    set({ profile, isOnboarded: true });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  loadProfile: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const profile = JSON.parse(raw) as Profile;
        set({ profile, isOnboarded: true });
      }
    } catch {
      // profil absent ou corrompu, onboarding requis
    } finally {
      set({ isLoading: false });
    }
  },

  incrementStreak: () => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, streak: profile.streak + 1 };
    get().setProfile(updated);
  },

  addXp: (amount) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, xp: profile.xp + amount };
    get().setProfile(updated);
  },
}));
