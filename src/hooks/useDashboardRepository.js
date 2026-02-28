/**
 * @fileoverview Custom hooks for dashboard data fetching
 * These hooks encapsulate business logic and use repositories
 * Fixed: Real-time subscriptions with proper closure handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CourseRepository,
  SessionRepository,
  AttendanceRepository,
  EnrollmentRepository,
  StatisticsRepository,
  UserRepository,
} from '../repositories/implementations';
import { subscribeToMultipleTables } from '../services/realtimeSubscriptionManager';

/**
 * Hook for fetching lecturer dashboard data
 * @param {string} lecturerId - Lecturer's user ID
 * @returns {{
 *   stats: import('../types').DashboardStats | null,
 *   recentSessions: import('../types').Session[],
 *   sessionPerformance: import('../types').SessionPerformance | null,
 *   courses: import('../types').Course[],
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function useLecturerDashboard(lecturerId) {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionPerformance, setSessionPerformance] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to store cleanup functions
  const cleanupRef = useRef(null);

  // Memoize fetchData so subscription callback always gets the latest version
  const fetchData = useCallback(async () => {
    if (!lecturerId) {
      setError(new Error('No lecturer ID provided'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 [Lecturer] Fetching dashboard data...');

      // Fetch all data in parallel
      const [statsData, coursesData, sessionsData] = await Promise.all([
        StatisticsRepository.getLecturerStats(lecturerId),
        CourseRepository.findByLecturer(lecturerId),
        SessionRepository.findByLecturer(lecturerId, { limit: 5 }),
      ]);

      setStats(statsData);
      setCourses(coursesData);
      setRecentSessions(sessionsData);

      // Calculate performance for the latest session
      if (sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        const sessionId = latestSession.active_session_id || latestSession.id;
        const expectedStudents = statsData?.totalStudents || 50;

        try {
          const performance = await StatisticsRepository.getSessionPerformance(
            sessionId,
            expectedStudents
          );

          setSessionPerformance({
            ...performance,
            course_code: latestSession.classes?.course_code || 'N/A',
          });
        } catch (perfError) {
          console.error('⚠️ [Lecturer] Error fetching session performance:', perfError);
        }
      }

      console.log('✅ [Lecturer] Dashboard data loaded');
    } catch (err) {
      console.error('❌ [Lecturer] Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [lecturerId]);

  // Setup initial data fetch and real-time subscriptions
  useEffect(() => {
    // Fetch data immediately
    fetchData();

    // Setup real-time subscriptions
    if (lecturerId) {
      console.log(`📡 [Lecturer] Setting up real-time subscriptions for ${lecturerId}`);

      cleanupRef.current = subscribeToMultipleTables({
        baseName: `lecturer_${lecturerId}`,
        onDataChange: fetchData, // This will always have the latest fetchData
        subscriptions: [
          {
            table: 'classes',
            event: '*',
            filter: `lecturer_id=eq.${lecturerId}`,
          },
          {
            table: 'sessions',
            event: '*',
            filter: `lecturer_id=eq.${lecturerId}`,
          },
          // NOTE: avoid subscribing to entire attendance_logs table (can trigger channel errors under RLS).
          // If you need attendance updates, subscribe to specific session IDs after fetchData returns.
        ],
      });
    }

    // Cleanup on unmount or lecturerId change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [lecturerId, fetchData]);

  return {
    stats,
    recentSessions,
    sessionPerformance,
    courses,
    loading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching student dashboard data
 * @param {string} studentId - Student's user ID
 * @returns {{
 *   stats: import('../types').StudentStats | null,
 *   courses: import('../types').Course[],
 *   attendance: import('../types').AttendanceLog[],
 *   trendData: Array<{month: string, attendance: number}>,
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function useStudentDashboard(studentId) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to store cleanup functions
  const cleanupRef = useRef(null);

  // Memoize fetchData so subscription callback always gets the latest version
  const fetchData = useCallback(async () => {
    if (!studentId) {
      setError(new Error('No student ID provided'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 [Student] Fetching dashboard data...');

      // Fetch all data in parallel
      const [statsData, coursesData, attendanceData, trendDataResult] = await Promise.all([
        StatisticsRepository.getStudentStats(studentId),
        CourseRepository.findByStudent(studentId),
        AttendanceRepository.findByStudent(studentId, { limit: 50 }),
        StatisticsRepository.getAttendanceTrendData(studentId, 6),
      ]);

      setStats(statsData);
      setCourses(coursesData);
      setAttendance(attendanceData);
      setTrendData(trendDataResult);

      console.log('✅ [Student] Dashboard data loaded');
    } catch (err) {
      console.error('❌ [Student] Error fetching dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to load student dashboard'));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Setup initial data fetch and real-time subscriptions
  useEffect(() => {
    // Fetch data immediately
    fetchData();

    // Setup real-time subscriptions
    if (studentId) {
      console.log(`📡 [Student] Setting up real-time subscriptions for ${studentId}`);

      cleanupRef.current = subscribeToMultipleTables({
        baseName: `student_${studentId}`,
        onDataChange: fetchData, // This will always have the latest fetchData
        subscriptions: [
          {
            table: 'class_enrollments',
            event: '*',
            filter: `student_id=eq.${studentId}`,
          },
          {
            table: 'attendance_logs',
            event: '*',
            filter: `student_id=eq.${studentId}`,
          },
          {
            table: 'profiles',
            event: 'UPDATE',
            filter: `id=eq.${studentId}`,
          },
        ],
      });
    }

    // Cleanup on unmount or studentId change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [studentId, fetchData]);

  return {
    stats,
    courses,
    attendance,
    trendData,
    loading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching user profile with details
 * @param {string} userId - User ID
 * @returns {{
 *   user: any,
 *   profile: import('../types').UserProfile | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useUserProfile(userId) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await UserRepository.fetchUserWithProfile(userId);
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return {
    user,
    profile,
    loading,
    error,
  };
}

/**
 * Hook for fetching course details with enrollments
 * @param {string} courseId - Course ID
 * @returns {{
 *   course: import('../types').Course | null,
 *   enrollments: import('../types').Enrollment[],
 *   studentCount: number,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useCourseDetails(courseId) {
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);

        const [courseData, enrollmentsData, count] = await Promise.all([
          CourseRepository.getById(courseId),
          EnrollmentRepository.findByCourse(courseId),
          EnrollmentRepository.countStudentsByCourse(courseId),
        ]);

        setCourse(courseData);
        setEnrollments(enrollmentsData);
        setStudentCount(count);
      } catch (err) {
        console.error('❌ Error fetching course details:', err);
        setError(err instanceof Error ? err : new Error('Failed to load course'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  return {
    course,
    enrollments,
    studentCount,
    loading,
    error,
  };
}

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
