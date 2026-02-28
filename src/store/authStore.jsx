// src/store/authStore.js
import { create } from 'zustand';
import authRepository from '../services/repositories/authRepository.js';
import { profileRepository } from '../services/repositories/index.js';


// TODO(MIGRATE): Keep migrating any remaining direct Supabase usage to repositories
import sessionStorageManager from '../services/sessionStorageManager';
import profileCacheService from '../services/profileCacheService';
import notify from '../services/notify.jsx';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  activeSession: null,
  loading: true,
  initialized: false,
  authSubscription: null,

  // Initialize and listen to auth changes
  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    // 1. Get current session via repository
    try {
      const session = await authRepository.getSession();
      if (session) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);

        // Restore active session from storage
        const savedSession = sessionStorageManager.getSession();
        if (savedSession && sessionStorageManager.hasValidSession()) {
          set({ activeSession: savedSession });
          notify.info(`Restored active session ${savedSession.id}`);
        }
      }
    } catch (err) {
      notify.error(err?.message || 'Failed to get session');
    }

    // 2. Listen for auth changes (Login, Logout, Token Refresh)
    const existingSubscription = get().authSubscription;
    if (existingSubscription) {
      try { existingSubscription(); } catch (e) { /* ignore */ }
    }

    const unsubscribe = authRepository.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if (session) {
          set({ user: session.user });
          await get().fetchProfile(session.user.id);
        } else {
          set({ user: null, profile: null, activeSession: null });
          sessionStorageManager.clearSession();
          profileCacheService.clearCache();
        }
        set({ loading: false });
      }, 0);
    });

    set({ loading: false, initialized: true, authSubscription: unsubscribe });
  },

  // Fetch custom profile data (Role, School, Dept)
  fetchProfile: async (userId) => {
    try {
      const data = await profileRepository.findById(userId);
      if (data) {
        set({ profile: data });
        profileCacheService.cacheProfile(userId, data);
      }
    } catch (err) {
      notify.error(err?.message || 'Error fetching profile');
    }
  },

  // Save active session (called when session is created)
  setActiveSession: (session) => {
    if (session) {
      sessionStorageManager.saveSession(session);
      set({ activeSession: session });
      notify.info(`Active session saved ${session.id}`);
    }
  },

  // Clear active session
  clearActiveSession: () => {
    sessionStorageManager.clearSession();
    set({ activeSession: null });
    notify.info('Active session cleared');
  },

  // Logout helper
  signOut: async () => {
    try {
      await authRepository.signOut();
    } catch (err) {
      // ignore signout errors but notify
      notify.error(err?.message || 'Sign out failed');
    }
    sessionStorageManager.clearSession();
    profileCacheService.clearCache();
    set({ user: null, profile: null, activeSession: null });
  }
}));