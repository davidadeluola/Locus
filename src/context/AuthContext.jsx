import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import authRepository from '../services/repositories/authRepository.js';
import { profileRepository, sessionRepository } from '../services/repositories/index.js';

// AuthContext: lightweight provider that uses repository interfaces only
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      // attempt common repository lookups (by id or by user_id)
      let next = await profileRepository.findById(userId);
      if (!next) next = await profileRepository.findByUserId(userId);
      setProfile(next || null);
      return next || null;
    } catch (e) {
      setProfile(null);
      return null;
    }
  };

  const fetchActiveSession = async (userId) => {
    try {
      const session = await sessionRepository.findActiveByLecturer(userId);
      setActiveSession(session || null);
      return session || null;
    } catch (e) {
      setActiveSession(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribeAuth = null;

    const bootstrap = async () => {
      setLoading(true);
      try {
        const session = await authRepository.getSession();
        if (!mounted) return;
        if (!session?.user) {
          setUser(null);
          setProfile(null);
          setActiveSession(null);
          setLoading(false);
          return;
        }

        setUser(session.user);
        const nextProfile = await fetchProfile(session.user.id);
        if (nextProfile?.role === 'lecturer') {
          await fetchActiveSession(session.user.id);
        }
      } catch (e) {
        setUser(null);
        setProfile(null);
        setActiveSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    // subscribe to auth state changes via repository wrapper
    unsubscribeAuth = authRepository.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setActiveSession(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      const nextProfile = await fetchProfile(session.user.id);
      if (nextProfile?.role === 'lecturer') {
        await fetchActiveSession(session.user.id);
      } else {
        setActiveSession(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      try {
        unsubscribeAuth?.();
      } catch (_) {
        // ignore
      }
    };
  }, []);

  // Finalize sessions automatically when activeSession expires
  useEffect(() => {
    if (!activeSession?.id || !activeSession?.expires_at) return undefined;
    const expiresAt = new Date(activeSession.expires_at).getTime();
    const now = Date.now();
    const delay = Math.max(0, expiresAt - now);
    const timer = setTimeout(async () => {
      try {
        await sessionRepository.finalizeSession(activeSession.id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to finalize session on expiry', e);
      } finally {
        setActiveSession(null);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [activeSession?.id, activeSession?.expires_at]);

  const signOut = async () => {
    try {
      await authRepository.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setActiveSession(null);
    }
  };

  const value = useMemo(
    () => ({ user, profile, activeSession, setActiveSession, loading, signOut }),
    [user, profile, activeSession, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
