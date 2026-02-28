/**
 * useSessionStorage - Custom hook for session persistence
 * Manages session data with automatic persistence to localStorage + sessionStorage
 * 
 * Usage:
 * const { session, saveSession, clearSession, hasValidSession } = useSessionStorage();
 */

import { useState, useEffect, useCallback } from "react";
import sessionStorageManager from "../services/sessionStorageManager";

export const useSessionStorage = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from storage on mount
  useEffect(() => {
    const savedSession = sessionStorageManager.getSession();
    if (savedSession) {
      setSession(savedSession);
    }
    setIsLoading(false);
  }, []);

  // Save session to storage
  const saveSession = useCallback((sessionData) => {
    const saved = sessionStorageManager.saveSession(sessionData);
    if (saved) {
      setSession(sessionData);
    }
    return saved;
  }, []);

  // Update session partially
  const updateSession = useCallback((updates) => {
    const updated = sessionStorageManager.updateSession(updates);
    if (updated) {
      const newSession = sessionStorageManager.getSession();
      setSession(newSession);
    }
    return updated;
  }, []);

  // Clear session from storage
  const clearSession = useCallback(() => {
    sessionStorageManager.clearSession();
    setSession(null);
  }, []);

  // Check if session is valid
  const hasValidSession = useCallback(() => {
    return sessionStorageManager.hasValidSession();
  }, []);

  // Get time remaining
  const getTimeRemaining = useCallback(() => {
    return sessionStorageManager.getTimeRemaining();
  }, []);

  // Sync from localStorage (useful when tab reopens)
  const syncFromStorage = useCallback(() => {
    const synced = sessionStorageManager.syncFromStorage();
    if (synced) {
      const restoredSession = sessionStorageManager.getSession();
      setSession(restoredSession);
    }
    return synced;
  }, []);

  return {
    session,
    isLoading,
    saveSession,
    updateSession,
    clearSession,
    hasValidSession,
    getTimeRemaining,
    syncFromStorage,
  };
};

export default useSessionStorage;
