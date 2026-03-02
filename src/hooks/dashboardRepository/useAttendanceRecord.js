import { useState, useEffect } from 'react';
import { AttendanceRepository } from '../../repositories/implementations';

/**
 * Hook for checking and recording attendance
 * @param {string} studentId - Student ID
 * @param {string} sessionId - Session ID
 * @returns {{
 *   hasAttended: boolean,
 *   recording: boolean,
 *   error: Error | null,
 *   recordAttendance: (data: any) => Promise<void>
 * }}
 */
export function useAttendanceRecord(studentId, sessionId) {
  const [hasAttended, setHasAttended] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !sessionId) return;

    const checkAttendance = async () => {
      try {
        const exists = await AttendanceRepository.exists(studentId, sessionId);
        setHasAttended(exists);
      } catch (err) {
        console.error('⚠️ Error checking attendance:', err);
      }
    };

    checkAttendance();
  }, [studentId, sessionId]);

  const recordAttendance = async (data) => {
    try {
      setRecording(true);
      setError(null);

      const attendanceData = {
        student_id: studentId,
        session_id: sessionId,
        signed_at: new Date().toISOString(),
        ...data,
      };

      await AttendanceRepository.create(attendanceData);
      setHasAttended(true);

      console.log('✅ Attendance recorded');
    } catch (err) {
      console.error('❌ Error recording attendance:', err);
      setError(err instanceof Error ? err : new Error('Failed to record attendance'));
    } finally {
      setRecording(false);
    }
  };

  return {
    hasAttended,
    recording,
    error,
    recordAttendance,
  };
}
