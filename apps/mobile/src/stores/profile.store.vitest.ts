import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from './profile.store';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('useProfileStore', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      isOnboarded: false,
      isLoading: true,
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useProfileStore.getState();

    expect(state.profile).toBeNull();
    expect(state.isOnboarded).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  describe('setProfile', () => {
    it('should set profile and mark as onboarded', async () => {
      const profile = {
        firstName: 'John',
        lastName: 'Shenouda',
        nativeLanguage: 'fr',
        level: 'A1',
        learningGoal: 'travel',
        dailyGoal: 10,
        streak: 0,
        xp: 0,
      } as any;

      await useProfileStore.getState().setProfile(profile);

      const state = useProfileStore.getState();
      expect(state.profile).toEqual(profile);
      expect(state.isOnboarded).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@englishflow/profile',
        JSON.stringify(profile),
      );
    });
  });

  describe('loadProfile', () => {
    it('should load profile from AsyncStorage', async () => {
      const profile = { firstName: 'John', lastName: 'Shenouda', streak: 5, xp: 100 };
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(profile));

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toEqual(profile);
      expect(state.isOnboarded).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to false even when no profile exists', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isOnboarded).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should handle corrupted data gracefully', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue('not-json{{{');

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.isLoading).toBe(false);
      // Profile should remain null on parse error
    });
  });

  describe('incrementStreak', () => {
    it('should increment streak by 1', async () => {
      useProfileStore.setState({
        profile: { firstName: 'J', lastName: 'S', streak: 3, xp: 0 } as any,
        isOnboarded: true,
      });

      useProfileStore.getState().incrementStreak();

      expect(useProfileStore.getState().profile!.streak).toBe(4);
    });

    it('should do nothing if no profile', () => {
      useProfileStore.getState().incrementStreak();
      expect(useProfileStore.getState().profile).toBeNull();
    });
  });

  describe('addXp', () => {
    it('should add XP to the profile', async () => {
      useProfileStore.setState({
        profile: { firstName: 'J', lastName: 'S', streak: 0, xp: 50 } as any,
        isOnboarded: true,
      });

      useProfileStore.getState().addXp(20);

      expect(useProfileStore.getState().profile!.xp).toBe(70);
    });

    it('should do nothing if no profile', () => {
      useProfileStore.getState().addXp(100);
      expect(useProfileStore.getState().profile).toBeNull();
    });
  });
});
