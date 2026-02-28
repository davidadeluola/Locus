/**
 * SessionStorageManager - Hybrid storage strategy for sessions
 * Persists session data across page refreshes using localStorage + sessionStorage
 * 
 * Storage Strategy:
 * - localStorage: Persistent across browser sessions (long-term backup)
 * - sessionStorage: Current tab session data (immediate access)
 * - Supabase: Source of truth (backend)
 */

class SessionStorageManager {
  constructor() {
    this.SESSION_KEY = "locus_active_session";
    this.SESSION_META_KEY = "locus_session_meta";
    this.SESSION_BACKUP_KEY = "locus_session_backup";
  }

  /**
   * Save session to both localStorage and sessionStorage
   * @param {Object} sessionData - Session object from Supabase
   */
  saveSession(sessionData) {
    if (!sessionData?.id) {
      console.warn("⚠️ Cannot save session: missing session ID");
      return false;
    }

    try {
      const sessionPayload = {
        ...sessionData,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage (persistent backup)
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(sessionPayload)
      );

      // Save to sessionStorage (current tab)
      sessionStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(sessionPayload)
      );

      // Save metadata for quick access
      const metadata = {
        sessionId: sessionData.id,
        classId: sessionData.class_id,
        createdAt: sessionData.created_at,
        expiresAt: sessionData.expires_at,
        savedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(this.SESSION_META_KEY, JSON.stringify(metadata));
      localStorage.setItem(
        this.SESSION_BACKUP_KEY,
        JSON.stringify(metadata)
      );

      console.log(
        "✅ Session saved to localStorage & sessionStorage:",
        sessionData.id
      );
      return true;
    } catch (err) {
      console.error("❌ Error saving session to storage:", err);
      return false;
    }
  }

  /**
   * Retrieve session from storage (sessionStorage preferred, fallback to localStorage)
   * @returns {Object|null} Session object or null if not found
   */
  getSession() {
    try {
      // Try sessionStorage first (current tab)
      let session = sessionStorage.getItem(this.SESSION_KEY);
      if (session) {
        console.log("✅ Session retrieved from sessionStorage");
        return JSON.parse(session);
      }

      // Fallback to localStorage (persistent backup)
      session = localStorage.getItem(this.SESSION_KEY);
      if (session) {
        console.log("✅ Session retrieved from localStorage (fallback)");
        return JSON.parse(session);
      }

      console.log("⚠️ No session found in storage");
      return null;
    } catch (err) {
      console.error("❌ Error retrieving session from storage:", err);
      return null;
    }
  }

  /**
   * Get session metadata only (faster than full session)
   * @returns {Object|null} Session metadata
   */
  getSessionMeta() {
    try {
      let meta = sessionStorage.getItem(this.SESSION_META_KEY);
      if (meta) return JSON.parse(meta);

      meta = localStorage.getItem(this.SESSION_BACKUP_KEY);
      if (meta) return JSON.parse(meta);

      return null;
    } catch (err) {
      console.error("❌ Error retrieving session metadata:", err);
      return null;
    }
  }

  /**
   * Update session (keeps other fields intact)
   * @param {Object} updates - Partial session object with fields to update
   */
  updateSession(updates) {
    try {
      const currentSession = this.getSession();
      if (!currentSession) {
        console.warn("⚠️ No session to update");
        return false;
      }

      const updatedSession = {
        ...currentSession,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return this.saveSession(updatedSession);
    } catch (err) {
      console.error("❌ Error updating session:", err);
      return false;
    }
  }

  /**
   * Clear all session data from storage
   */
  clearSession() {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.SESSION_BACKUP_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.SESSION_META_KEY);

      console.log("✅ Session cleared from all storage");
      return true;
    } catch (err) {
      console.error("❌ Error clearing session:", err);
      return false;
    }
  }

  /**
   * Check if session exists and is still valid
   * @returns {boolean}
   */
  hasValidSession() {
    try {
      const session = this.getSession();
      if (!session?.expires_at) return false;

      const expiresAt = new Date(session.expires_at);
      const now = new Date();

      return now < expiresAt;
    } catch (err) {
      console.error("❌ Error checking session validity:", err);
      return false;
    }
  }

  /**
   * Get time remaining until session expires (in milliseconds)
   * @returns {number} Milliseconds remaining, or -1 if expired
   */
  getTimeRemaining() {
    try {
      const session = this.getSession();
      if (!session?.expires_at) return -1;

      const expiresAt = new Date(session.expires_at);
      const now = new Date();
      const remaining = expiresAt - now;

      return remaining > 0 ? remaining : -1;
    } catch (err) {
      console.error("❌ Error calculating remaining time:", err);
      return -1;
    }
  }

  /**
   * Sync session from localStorage to sessionStorage
   * Useful when tab is reopened
   */
  syncFromStorage() {
    try {
      const backup = localStorage.getItem(this.SESSION_KEY);
      if (backup) {
        sessionStorage.setItem(this.SESSION_KEY, backup);
        const backupMeta = localStorage.getItem(this.SESSION_BACKUP_KEY);
        if (backupMeta) {
          sessionStorage.setItem(this.SESSION_META_KEY, backupMeta);
        }
        console.log("✅ Session synced from localStorage to sessionStorage");
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error syncing session:", err);
      return false;
    }
  }
}

// Export singleton instance
export default new SessionStorageManager();
