import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { sessionRepository, courseRepository } from '../../services/repositories/index.js';
import sessionService from '../../services/domain/sessionService';
import notify from '../../services/notify.jsx';
import CreateSessionForm from './components/CreateSessionForm';
import ActiveSession from './components/ActiveSession';
// Migrated: use `sessionRepository` and `courseRepository` instead of direct Supabase.
import { generateOTP, getCurrentLocation } from "../../lib/utils/attendanceUtils";
import { useUser } from "../../hooks/useUser";
import { useAuthContext } from '../../context/AuthContext';
import { useSessionStorage } from "../../hooks/useSessionStorage";
// sessionStorageManager intentionally not needed here; storage handled via hook

const MAX_SESSION_DURATION_MINUTES = 5;
const DEFAULT_SESSION_DURATION_MINUTES = 5;

const CreateSession = ({ classId, onSessionCreated }) => {
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

  // Fetch courses for selection
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      try {
        const data = await courseRepository.findByLecturer(user.id);
        setCourses(data || []);
        if (classId) setSelectedClassId(classId);
      } catch (err) {
        notify.error(err?.message || 'Failed to load courses');
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id, classId]);

  // Countdown timer
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setSession(null);
        clearStoredSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, clearStoredSession]);

  // QR generation removed — app uses OTP only

  const createSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current geolocation
      const location = await getCurrentLocation();

      // Generate OTP
      const otpSecret = generateOTP();

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      // Prepare session data
      const sessionData = {
        lecturer_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        otp_secret: otpSecret,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      // Include class_id if selected
      if (selectedClassId && typeof selectedClassId === 'string') {
        sessionData.class_id = selectedClassId;
      }

      const data = await sessionRepository.create(sessionData);
      notify.success('Session created');

      // Save to localStorage and sessionStorage
      saveSession(data);

      // Update local component state
      setSession(data);
      setTimeRemaining(durationMinutes * 60);

      // Update global active session so dashboards see the new session
      try { setActiveSession(data); } catch { /* ignore if context not present */ }

      if (onSessionCreated) {
        onSessionCreated(data);
      }
    } catch (err) {
      console.error("❌ Session creation error:", err);
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  }, [user.id, durationMinutes, selectedClassId, saveSession, onSessionCreated, setActiveSession]);

  const endSession = async () => {
    if (!session) return;

    try {
      // finalize and archive session (copy logs to audit and mark archived)
      try {
        await sessionRepository.finalizeSession(session.id);
      } catch (e) {
        // best-effort; continue to clear local state
        console.warn('finalizeSession failed', e);
      }

      await sessionRepository.update(session.id, { expires_at: new Date().toISOString() });

      // attempt to build a session summary and export to Excel immediately
      try {
        const room = await sessionService.buildRoom(session.id);
        if (room) {
          const ExcelMod = await import('exceljs');
          const ExcelJS = ExcelMod.default || ExcelMod;
          const wb = new ExcelJS.Workbook();
          const ws = wb.addWorksheet('Session Summary');
          ws.columns = [
            { header: 's/n', key: 'sn', width: 8 },
            { header: 'filename', key: 'filename', width: 40 },
            { header: 'attendant_count', key: 'attendant_count', width: 20 },
            { header: 'date', key: 'date', width: 24 },
          ];

          const filename = `${(room.class?.title || 'session').replace(/\s+/g, '_')}_attendance.xlsx`;
          ws.addRow({ sn: 1, filename, attendant_count: room.metrics?.present || 0, date: room.session?.expires_at || new Date().toISOString() });

          const buf = await wb.xlsx.writeBuffer();
          const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      } catch (e) {
        console.warn('session export failed', e);
      }

      setSession(null);
      setTimeRemaining(0);
      clearStoredSession();
      try { setActiveSession(null); } catch { /* ignore */ }
      notify.info('Session terminated and archived');
    } catch (err) {
      console.error("❌ Error ending session:", err);
    }
  };

  const extendSession = async (minutes = 5) => {
    if (!session) return;
    try {
      const currentExpires = new Date(session.expires_at || Date.now());
      const newExpires = new Date(currentExpires.getTime() + minutes * 60 * 1000);
      const updated = await sessionRepository.update(session.id, { expires_at: newExpires.toISOString() });
      // update local state
      setSession(updated);
      setTimeRemaining(Math.max(0, Math.floor((new Date(updated.expires_at) - new Date()) / 1000)));
      notify.success(`Session extended by ${minutes} minutes`);
      try { setActiveSession(updated); } catch { /* ignore */ }
    } catch (err) {
      console.error('extendSession failed', err);
      notify.error('Failed to extend session');
    }
  };

  const regenerateSession = async () => {
    if (!session?.id) return;
    try {
      const updated = await sessionService.regenerateOtp(session.id);
      setSession(updated);
      saveSession(updated);
      try { setActiveSession(updated); } catch { /* ignore */ }
      notify.info('Session regenerated');
    } catch (err) {
      console.error('regenerateSession failed', err);
      notify.error('Failed to regenerate session');
    }
  };

  // Sync savedSession with global context on mount
  useEffect(() => {
    if (savedSession) {
      try { setActiveSession(savedSession); } catch { /* ignore */ }
    }
  }, [savedSession, setActiveSession]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <CreateSessionForm
              courses={courses}
              courseLoading={courseLoading}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              durationMinutes={durationMinutes}
              setDurationMinutes={setDurationMinutes}
              MAX_SESSION_DURATION_MINUTES={MAX_SESSION_DURATION_MINUTES}
              loading={loading}
              createSession={createSession}
              error={error}
            />
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <ActiveSession
              session={session}
              timeRemaining={timeRemaining}
              endSession={endSession}
              extendSession={extendSession}
              regenerateSession={regenerateSession}
              formatTime={formatTime}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

  const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default CreateSession;
