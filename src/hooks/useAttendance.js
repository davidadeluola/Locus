import { useMemo, useState } from "react";
import { createElement } from "react";
import { attendanceRepository, sessionRepository } from '../services/repositories/index.js';
import authRepository from '../services/repositories/authRepository.js';
import { supabase } from "../api/supabase";
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { calculateDistance } from "../lib/utils/attendanceUtils";

const MAX_DISTANCE_METERS = 300;

const showAuditToast = (studentName) => {
  toast('Audit Entry Created', {
    description: `Security log generated for ${studentName}`,
    style: {
      background: '#171717',
      color: '#ffffff',
      border: 'none',
    },
    icon: createElement(ShieldCheck, { size: 16, color: '#10b981' }),
  });
};

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

      const studentName = user?.user_metadata?.full_name || user?.email || 'student';

      setDistancePayload({
        studentLocation,
        sessionLocation: { latitude: session.latitude, longitude: session.longitude },
      });

      // 3. Preferred path: server-side verification/logging RPC with explicit 300m range
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('verify_and_log_attendance', {
          p_session_id: session.id,
          p_student_lat: studentLocation.latitude,
          p_student_long: studentLocation.longitude,
          p_max_distance_meters: 300.0,
        });

        if (!rpcError && rpcData) {
          if (rpcData.success) {
            const distance = Number(rpcData.distance ?? 0);
            toast.success('Attendance Recorded', {
              description: `Distance: ${Math.round(distance)}m from lecturer.`,
            });
            showAuditToast(studentName);
            setSuccess(true);
            setLoading(false);
            return {
              success: true,
              distance: Math.round(distance),
            };
          }

          const distance = Number(rpcData.distance ?? 0);
          toast.error('Out of Range', {
            description: `You are ${Math.round(distance)}m away. Must be under 300m.`,
            style: { background: '#fef2f2', color: '#991b1b' },
          });
          setError('OUT_OF_RANGE');
          setLoading(false);
          return {
            success: false,
            error: 'OUT_OF_RANGE',
            distance: Math.round(distance),
          };
        }
      } catch {
        // fallback to local verification path below
      }

      // 4. Fallback: Calculate distance using Haversine
      const distance = calculateDistance(
        studentLocation.latitude,
        studentLocation.longitude,
        session.latitude,
        session.longitude
      );

      // 5. Check if within geofence radius (300m)
      if (distance > MAX_DISTANCE_METERS) {
        toast.error('Out of Range', {
          description: `You are ${Math.round(distance)}m away. Must be under 300m.`,
          style: { background: '#fef2f2', color: '#991b1b' },
        });
        setError("OUT_OF_RANGE");
        setLoading(false);
        return {
          success: false,
          error: "OUT_OF_RANGE",
          distance: Math.round(distance),
        };
      }

      // 6. Check if already signed in for this session
      const existingLogs = await attendanceRepository.findBySession(session.id);
      if (existingLogs?.some(l => l.student_id === user.id)) {
        throw new Error('You have already signed in for this session');
      }

      // 7. Insert attendance log via repository
      await attendanceRepository.log({
        session_id: session.id,
        student_id: user.id,
        distance_meters: Math.round(distance),
        signed_at: new Date().toISOString(),
      });

      toast.success('Attendance Recorded', {
        description: `Distance: ${Math.round(distance)}m from lecturer.`,
      });
      showAuditToast(studentName);

      setSuccess(true);
      setLoading(false);

      return {
        success: true,
        distance: Math.round(distance),
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit attendance';
      toast.error(errorMessage);
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
