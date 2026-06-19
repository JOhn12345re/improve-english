import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from './onboarding.store';
import { CefrLevel, DailyGoalMinutes, LearningGoal, NativeLanguage } from '@englishflow/shared-types';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('should have correct default state', () => {
    const state = useOnboardingStore.getState();

    expect(state.firstName).toBe('');
    expect(state.lastName).toBe('');
    expect(state.nativeLanguage).toBe(NativeLanguage.FR);
    expect(state.level).toBeNull();
    expect(state.learningGoal).toBeNull();
    expect(state.dailyGoal).toBe(DailyGoalMinutes.TEN);
    expect(state.notificationsEnabled).toBe(false);
  });

  describe('setFirstName', () => {
    it('should set the first name', () => {
      useOnboardingStore.getState().setFirstName('John');
      expect(useOnboardingStore.getState().firstName).toBe('John');
    });
  });

  describe('setLastName', () => {
    it('should set the last name', () => {
      useOnboardingStore.getState().setLastName('Shenouda');
      expect(useOnboardingStore.getState().lastName).toBe('Shenouda');
    });
  });

  describe('setNativeLanguage', () => {
    it('should set the native language', () => {
      useOnboardingStore.getState().setNativeLanguage(NativeLanguage.AR);
      expect(useOnboardingStore.getState().nativeLanguage).toBe(NativeLanguage.AR);
    });
  });

  describe('setLevel', () => {
    it('should set the CEFR level', () => {
      useOnboardingStore.getState().setLevel(CefrLevel.B1);
      expect(useOnboardingStore.getState().level).toBe(CefrLevel.B1);
    });
  });

  describe('setLearningGoal', () => {
    it('should set the learning goal', () => {
      useOnboardingStore.getState().setLearningGoal(LearningGoal.WORK);
      expect(useOnboardingStore.getState().learningGoal).toBe(LearningGoal.WORK);
    });
  });

  describe('setDailyGoal', () => {
    it('should set the daily goal', () => {
      useOnboardingStore.getState().setDailyGoal(DailyGoalMinutes.THIRTY);
      expect(useOnboardingStore.getState().dailyGoal).toBe(DailyGoalMinutes.THIRTY);
    });
  });

  describe('setNotificationsEnabled', () => {
    it('should toggle notifications', () => {
      useOnboardingStore.getState().setNotificationsEnabled(true);
      expect(useOnboardingStore.getState().notificationsEnabled).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all fields to defaults', () => {
      const store = useOnboardingStore.getState();
      store.setFirstName('John');
      store.setLastName('Shenouda');
      store.setLevel(CefrLevel.B2);
      store.setLearningGoal(LearningGoal.STUDIES);
      store.setDailyGoal(DailyGoalMinutes.THIRTY);
      store.setNotificationsEnabled(true);
      store.setNativeLanguage(NativeLanguage.ES);

      useOnboardingStore.getState().reset();

      const state = useOnboardingStore.getState();
      expect(state.firstName).toBe('');
      expect(state.lastName).toBe('');
      expect(state.nativeLanguage).toBe(NativeLanguage.FR);
      expect(state.level).toBeNull();
      expect(state.learningGoal).toBeNull();
      expect(state.dailyGoal).toBe(DailyGoalMinutes.TEN);
      expect(state.notificationsEnabled).toBe(false);
    });
  });

  describe('full onboarding flow', () => {
    it('should handle a complete onboarding sequence', () => {
      const store = useOnboardingStore.getState();

      store.setFirstName('Marie');
      store.setLastName('Dupont');
      store.setNativeLanguage(NativeLanguage.FR);
      store.setLevel(CefrLevel.A2);
      store.setLearningGoal(LearningGoal.TRAVEL);
      store.setDailyGoal(DailyGoalMinutes.FIFTEEN);
      store.setNotificationsEnabled(true);

      const state = useOnboardingStore.getState();
      expect(state.firstName).toBe('Marie');
      expect(state.lastName).toBe('Dupont');
      expect(state.nativeLanguage).toBe(NativeLanguage.FR);
      expect(state.level).toBe(CefrLevel.A2);
      expect(state.learningGoal).toBe(LearningGoal.TRAVEL);
      expect(state.dailyGoal).toBe(DailyGoalMinutes.FIFTEEN);
      expect(state.notificationsEnabled).toBe(true);
    });
  });
});
