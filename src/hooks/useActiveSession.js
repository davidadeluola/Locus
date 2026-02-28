/**
 * useActiveSession - Custom hook to manage active session
 * Integrates with AuthStore and SessionStorageManager
 * 
 * Usage:
 * const { activeSession, saveSession, clearSession } = useActiveSession();
 */

import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";

export const useActiveSession = () => {
  const activeSession = useAuthStore((state) => state.activeSession);
  const setActiveSession = useAuthStore((state) => state.setActiveSession);
  const clearActiveSession = useAuthStore((state) => state.clearActiveSession);

  // Save session
  const saveSession = useCallback((session) => {
    setActiveSession(session);
  }, [setActiveSession]);

  // Clear session
  const clearSession = useCallback(() => {
    clearActiveSession();
  }, [clearActiveSession]);

  return {
    activeSession,
    saveSession,
    clearSession,
  };
};

export default useActiveSession;
