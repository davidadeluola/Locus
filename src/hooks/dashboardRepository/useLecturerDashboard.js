import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CourseRepository,
  SessionRepository,
  EnrollmentRepository,
  StatisticsRepository,
} from '../../repositories/implementations';
import { subscribeToMultipleTables } from '../../services/realtimeSubscriptionManager';

/**
 * Hook for fetching lecturer dashboard data
 * @param {string} lecturerId - Lecturer's user ID
 * @returns {{
 *   stats: import('../../types').DashboardStats | null,
 *   recentSessions: import('../../types').Session[],
 *   sessionPerformance: import('../../types').SessionPerformance | null,
 *   courses: import('../../types').Course[],
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

  const cleanupRef = useRef(null);

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

      const [statsData, coursesData, sessionsData] = await Promise.all([
        StatisticsRepository.getLecturerStats(lecturerId),
        CourseRepository.findByLecturer(lecturerId),
        SessionRepository.findByLecturer(lecturerId, { limit: 5 }),
      ]);

      setStats(statsData);
      setCourses(coursesData);
      setRecentSessions(sessionsData);

      if (sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        const sessionId = latestSession.active_session_id || latestSession.id;
        let expectedStudents = 0;

        if (latestSession?.class_id) {
          try {
            expectedStudents = await EnrollmentRepository.countStudentsByCourse(latestSession.class_id);
          } catch (enrollCountError) {
            console.warn('⚠️ [Lecturer] Could not count class enrollments for latest session:', enrollCountError);
          }
        }

        if (!expectedStudents || expectedStudents < 0) {
          expectedStudents = statsData?.totalStudents || 0;
        }

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

  useEffect(() => {
    fetchData();

    if (lecturerId) {
      console.log(`📡 [Lecturer] Setting up real-time subscriptions for ${lecturerId}`);

      cleanupRef.current = subscribeToMultipleTables({
        baseName: `lecturer_${lecturerId}`,
        onDataChange: fetchData,
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
        ],
      });
    }

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
