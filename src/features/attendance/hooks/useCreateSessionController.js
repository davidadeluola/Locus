import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import { useSessionStorage } from '../../../hooks/useSessionStorage';
import { useUser } from '../../../hooks/useUser';
import { generateOTP, getCurrentLocation } from '../../../lib/utils/attendanceUtils';
import summaryExportService from '../../../services/domain/summaryExportService.js';
import sessionService from '../../../services/domain/sessionService';
import notify from '../../../services/notify.jsx';
import { courseRepository, sessionRepository } from '../../../services/repositories/index.js';

export const MAX_SESSION_DURATION_MINUTES = 5;
const DEFAULT_SESSION_DURATION_MINUTES = 5;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function buildSessionSummaryRows(room, sessionId) {
  const filename = `${(room.class?.title || 'session').replace(/\s+/g, '_')}_attendance_summary.xls`;

  return {
    filename,
    rows: [[
      1,
      sessionId,
      room.class?.code || '',
      room.class?.title || '',
      room.metrics?.present || 0,
      room.session?.expires_at || new Date().toISOString(),
    ]],
  };
}

export default function useCreateSessionController({ classId, onSessionCreated }) {
  const { user } = useUser();
  const { setActiveSession } = useAuthContext();
  const { session: savedSession, saveSession, clearSession: clearStoredSession } = useSessionStorage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(savedSession || null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_SESSION_DURATION_MINUTES);
  const [selectedClassId, setSelectedClassId] = useState(classId);
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;

      try {
        const data = await courseRepository.findByLecturer(user.id);
        setCourses(data || []);
        if (classId) setSelectedClassId(classId);
      } catch (fetchError) {
        notify.error(fetchError?.message || 'Failed to load courses');
      } finally {
        setCourseLoading(false);
      }
    };

    void fetchCourses();
  }, [classId, user?.id]);

  useEffect(() => {
    if (!session) return undefined;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(session.expires_at) - new Date()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setSession(null);
        clearStoredSession();
        try { setActiveSession(null); } catch { /* ignore */ }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clearStoredSession, session, setActiveSession]);

  const createSession = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      const payload = {
        lecturer_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        otp_secret: generateOTP(),
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      if (selectedClassId && typeof selectedClassId === 'string') {
        payload.class_id = selectedClassId;
      }

      const data = await sessionRepository.create(payload);
      saveSession(data);
      setSession(data);
      setTimeRemaining(durationMinutes * 60);
      try { setActiveSession(data); } catch { /* ignore */ }
      notify.success('Session created');

      if (onSessionCreated) {
        onSessionCreated(data);
      }
    } catch (createError) {
      console.error('Session creation error:', createError);
      setError(createError?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  }, [durationMinutes, onSessionCreated, saveSession, selectedClassId, setActiveSession, user?.id]);

  const endSession = useCallback(async () => {
    if (!session || !user?.id) return;

    try {
      try {
        await sessionRepository.finalizeSession(session.id);
      } catch (finalizeError) {
        console.warn('finalizeSession failed', finalizeError);
      }

      await sessionRepository.update(session.id, { expires_at: new Date().toISOString() });

      try {
        const room = await sessionService.buildRoom(session.id);
        if (room) {
          const { filename, rows } = buildSessionSummaryRows(room, session.id);
          await summaryExportService.saveAndDownloadCsvFile({
            exportKey: `session:${session.id}:finalize`,
            lecturerId: user.id,
            sessionId: session.id,
            classId: session.class_id || null,
            scope: 'session',
            source: 'finalize',
            filename,
            mimeType: 'application/vnd.ms-excel',
            fileExtension: 'xls',
            headers: ['s/n', 'session_id', 'course_code', 'course_title', 'attendant_count', 'date'],
            rows,
            summaryDate: room.session?.expires_at || new Date().toISOString(),
            metadata: {
              course_code: room.class?.code || '',
              course_title: room.class?.title || '',
              attendant_count: room.metrics?.present || 0,
            },
          });
        }
      } catch (exportError) {
        console.warn('session export failed', exportError);
      }

      setSession(null);
      setTimeRemaining(0);
      clearStoredSession();
      try { setActiveSession(null); } catch { /* ignore */ }
      notify.info('Session terminated and archived');
    } catch (endError) {
      console.error('Error ending session:', endError);
      notify.error(endError?.message || 'Failed to end session');
    }
  }, [clearStoredSession, session, setActiveSession, user?.id]);

  const extendSession = useCallback(async (minutes = 5) => {
    if (!session) return;

    try {
      const currentExpires = new Date(session.expires_at || Date.now());
      const newExpires = new Date(currentExpires.getTime() + minutes * 60 * 1000);
      const updated = await sessionRepository.update(session.id, { expires_at: newExpires.toISOString() });
      setSession(updated);
      saveSession(updated);
      setTimeRemaining(Math.max(0, Math.floor((new Date(updated.expires_at) - new Date()) / 1000)));
      try { setActiveSession(updated); } catch { /* ignore */ }
      notify.success(`Session extended by ${minutes} minutes`);
    } catch (extendError) {
      console.error('extendSession failed', extendError);
      notify.error('Failed to extend session');
    }
  }, [saveSession, session, setActiveSession]);

  const regenerateSession = useCallback(async () => {
    if (!session?.id) return;

    try {
      const updated = await sessionService.regenerateOtp(session.id);
      setSession(updated);
      saveSession(updated);
      try { setActiveSession(updated); } catch { /* ignore */ }
      notify.info('Session regenerated');
    } catch (regenerateError) {
      console.error('regenerateSession failed', regenerateError);
      notify.error('Failed to regenerate session');
    }
  }, [saveSession, session?.id, setActiveSession]);

  useEffect(() => {
    if (!savedSession) return;
    try { setActiveSession(savedSession); } catch { /* ignore */ }
  }, [savedSession, setActiveSession]);

  return {
    loading,
    error,
    session,
    timeRemaining,
    durationMinutes,
    setDurationMinutes,
    selectedClassId,
    setSelectedClassId,
    courses,
    courseLoading,
    createSession,
    endSession,
    extendSession,
    regenerateSession,
    formatTime,
    maxSessionDurationMinutes: MAX_SESSION_DURATION_MINUTES,
  };
}