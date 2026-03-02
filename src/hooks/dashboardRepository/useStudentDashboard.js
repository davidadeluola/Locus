import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CourseRepository,
  AttendanceRepository,
  StatisticsRepository,
} from '../../repositories/implementations';
import { subscribeToMultipleTables } from '../../services/realtimeSubscriptionManager';

/**
 * Hook for fetching student dashboard data
 * @param {string} studentId - Student's user ID
 * @returns {{
 *   stats: import('../../types').StudentStats | null,
 *   courses: import('../../types').Course[],
 *   attendance: import('../../types').AttendanceLog[],
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

  const cleanupRef = useRef(null);

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

  useEffect(() => {
    fetchData();

    if (studentId) {
      console.log(`📡 [Student] Setting up real-time subscriptions for ${studentId}`);

      cleanupRef.current = subscribeToMultipleTables({
        baseName: `student_${studentId}`,
        onDataChange: fetchData,
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
