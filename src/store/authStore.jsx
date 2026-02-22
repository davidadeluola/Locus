// src/store/authStore.js
import { create } from 'zustand';
import { supabase } from '../api/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  authSubscription: null,

  // Initialize and listen to auth changes
  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      set({ user: session.user });
      await get().fetchProfile(session.user.id);
    }

    // 2. Listen for auth changes (Login, Logout, Token Refresh)
    const existingSubscription = get().authSubscription;
    if (existingSubscription) {
      existingSubscription.unsubscribe();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
      if (session) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null });
      }
      set({ loading: false });
      }, 0);
    });

    set({ loading: false, initialized: true, authSubscription: subscription });
  },

  // Fetch custom profile data (Role, School, Dept)
  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error) {
      set({ profile: data });
    }
  },

  // Logout helper
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));