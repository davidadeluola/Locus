import { useMemo, useState } from "react";
import { supabase } from "../api/supabase";
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
      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Authentication required");
      }

      // 2. Fetch active session matching OTP
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("id, latitude, longitude, expires_at")
        .eq("otp_secret", otpCode)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (sessionError || !session) {
        throw new Error("Invalid or expired session code");
      }

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
      const { data: existingLog } = await supabase
        .from("attendance_logs")
        .select("id")
        .eq("session_id", session.id)
        .eq("student_id", user.id)
        .maybeSingle();

      if (existingLog) {
        throw new Error("You have already signed in for this session");
      }

      // 6. Insert attendance log
      const { error: insertError } = await supabase
        .from("attendance_logs")
        .insert({
          session_id: session.id,
          student_id: user.id,
          distance_meters: Math.round(distance),
          signed_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setLoading(false);

      return {
        success: true,
        distance: Math.round(distance),
      };
    } catch (err) {
      const errorMessage = err.message || "Failed to submit attendance";
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
