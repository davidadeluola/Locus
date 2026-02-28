import { useMemo, useState } from "react";
import { attendanceRepository, sessionRepository } from '../services/repositories/index.js';
import authRepository from '../services/repositories/authRepository.js';
import notify from '../services/notify.jsx';
import { calculateDistance } from "../lib/utils/attendanceUtils";

const MAX_DISTANCE_METERS = 100;

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [distancePayload, setDistancePayload] = useState(null);

  const previewDistance = useMemo(() => {
    if (!distancePayload) return null;
    const { studentLocation, sessionLocation } = distancePayload;
    const distance = calculateDistance(
      studentLocation.latitude,
      studentLocation.longitude,
      sessionLocation.latitude,
      sessionLocation.longitude
    );
    return Math.round(distance);
  }, [distancePayload]);

  /**
   * Submit attendance with geofencing verification
   * @param {string} otpCode - 6-digit OTP code
   * @param {object} studentLocation - {latitude, longitude}
   * @returns {Promise<{success: boolean, error?: string, distance?: number}>}
   */
  const submitAttendance = async (otpCode, studentLocation) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get current user from auth repository
      const sessionInfo = await authRepository.getSession();
      const user = sessionInfo?.user;
      if (!user) throw new Error('Authentication required');

      // 2. Fetch active session matching OTP via repository
      const session = await sessionRepository.findActiveByOtp(otpCode);
      if (!session) throw new Error('Invalid or expired session code');

      setDistancePayload({
        studentLocation,
        sessionLocation: { latitude: session.latitude, longitude: session.longitude },
      });

      // 3. Calculate distance using Haversine
      const distance = calculateDistance(
        studentLocation.latitude,
        studentLocation.longitude,
        session.latitude,
        session.longitude
      );

      // 4. Check if within geofence radius
      if (distance > MAX_DISTANCE_METERS) {
        setError("OUT_OF_RANGE");
        setLoading(false);
        return {
          success: false,
          error: "OUT_OF_RANGE",
          distance: Math.round(distance),
        };
      }

      // 5. Check if already signed in for this session
      const existingLogs = await attendanceRepository.findBySession(session.id);
      if (existingLogs?.some(l => l.student_id === user.id)) {
        throw new Error('You have already signed in for this session');
      }

      // 6. Insert attendance log via repository
      await attendanceRepository.log({
        session_id: session.id,
        student_id: user.id,
        distance_meters: Math.round(distance),
        signed_at: new Date().toISOString(),
      });

      setSuccess(true);
      setLoading(false);

      return {
        success: true,
        distance: Math.round(distance),
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit attendance';
      notify.error(errorMessage);
      setError(errorMessage);
      setLoading(false);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    submitAttendance,
    loading,
    error,
    success,
    previewDistance,
    reset,
  };
};
