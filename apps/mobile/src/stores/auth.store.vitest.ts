import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      supabaseUser: null,
      profile: null,
      isLoading: true,
      isOnboarded: false,
    });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.supabaseUser).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isOnboarded).toBe(false);
  });

  describe('setSupabaseUser', () => {
    it('should set the supabase user', () => {
      const mockUser = { id: 'u1', email: 'test@brila.com' } as any;

      useAuthStore.getState().setSupabaseUser(mockUser);

      expect(useAuthStore.getState().supabaseUser).toEqual(mockUser);
    });

    it('should accept null to clear user', () => {
      useAuthStore.getState().setSupabaseUser({ id: 'u1' } as any);
      useAuthStore.getState().setSupabaseUser(null);

      expect(useAuthStore.getState().supabaseUser).toBeNull();
    });
  });

  describe('setProfile', () => {
    it('should set the user profile', () => {
      const profile = { id: 'u1', email: 'x@x.com', level: 'A1' } as any;

      useAuthStore.getState().setProfile(profile);

      expect(useAuthStore.getState().profile).toEqual(profile);
    });
  });

  describe('setLoading', () => {
    it('should update isLoading', () => {
      useAuthStore.getState().setLoading(false);

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setOnboarded', () => {
    it('should update isOnboarded', () => {
      useAuthStore.getState().setOnboarded(true);

      expect(useAuthStore.getState().isOnboarded).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user, profile, and onboarded state', () => {
      useAuthStore.setState({
        supabaseUser: { id: 'u1' } as any,
        profile: { id: 'u1' } as any,
        isOnboarded: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.supabaseUser).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isOnboarded).toBe(false);
    });

    it('should preserve isLoading state after logout', () => {
      useAuthStore.setState({ isLoading: false });

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
