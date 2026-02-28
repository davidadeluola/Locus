import { useEffect, useState, useCallback } from 'react';
import sessionService from '../services/domain/sessionService.js';
import { subscribeToAttendance } from '../services/subscriptions/attendanceSubscription.js';
import notify from '../services/notify.jsx';

export default function useSessionRoom(sessionId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const payload = await sessionService.buildRoom(sessionId);
      setRoom(payload);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load room');
      notify.error(e.message || 'Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refresh();
    if (!sessionId) return undefined;
    const cleanup = subscribeToAttendance(sessionId, { onInsert: refresh, onUpdate: refresh, onDelete: refresh });
    return () => {
      try { cleanup(); } catch (e) { /* ignore */ }
    };
  }, [sessionId, refresh]);

  const regenerateOtp = useCallback(async () => {
    if (!sessionId) throw new Error('sessionId required');
    try {
      const updated = await sessionService.regenerateOtp(sessionId);
      // refresh local snapshot
      await refresh();
      notify.info('OTP regenerated');
      return updated;
    } catch (e) {
      notify.error(e.message || 'Failed to regenerate OTP');
      throw e;
    }
  }, [sessionId, refresh]);

  return { room, loading, error, refresh, regenerateOtp };
}
