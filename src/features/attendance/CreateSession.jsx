import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sessionRepository, courseRepository } from '../../services/repositories/index.js';
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
      try { setActiveSession(data); } catch (e) { /* ignore if context not present */ }

      if (onSessionCreated) {
        onSessionCreated(data);
      }
    } catch (err) {
      console.error("❌ Session creation error:", err);
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  }, [user.id, durationMinutes, selectedClassId, saveSession, onSessionCreated]);

  const endSession = async () => {
    if (!session) return;

    try {
      await sessionRepository.update(session.id, { expires_at: new Date().toISOString() });
      setSession(null);
      setTimeRemaining(0);
      clearStoredSession();
      try { setActiveSession(null); } catch (e) { /* ignore */ }
      notify.info('Session terminated');
    } catch (err) {
      console.error("❌ Error ending session:", err);
    }
  };

  // Sync savedSession with global context on mount
  useEffect(() => {
    if (savedSession) {
      try { setActiveSession(savedSession); } catch (e) { /* ignore */ }
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
            <ActiveSession session={session} timeRemaining={timeRemaining} endSession={endSession} formatTime={formatTime} />
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
