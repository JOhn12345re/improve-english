import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@englishflow/shared-types';

interface AuthState {
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  supabaseUser: null,
  profile: null,
  isLoading: true,
  isOnboarded: false,
  setSupabaseUser: (supabaseUser) => set({ supabaseUser }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  logout: () => set({ supabaseUser: null, profile: null, isOnboarded: false }),
}));
