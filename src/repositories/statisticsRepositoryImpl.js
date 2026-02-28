import { supabase } from '../api/supabase';

export const StatisticsRepository = {
  async getLecturerStats(lecturerId) {
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('classes')
        .select('id')
        .eq('lecturer_id', lecturerId);

      if (coursesError) throw coursesError;

      const courseIds = courses?.map(c => c.id) || [];
      const totalCourses = courseIds.length;

      let totalStudents = 0;
      if (courseIds.length > 0) {
        // Prefer counting via student_id; if schema or RLS prevents that, fall back to profile join
        try {
          const { data: enrollRows, error: enrollErr } = await supabase
            .from('class_enrollments')
            .select('student_id')
            .in('class_id', courseIds);

          if (!enrollErr && Array.isArray(enrollRows)) {
            totalStudents = new Set(enrollRows.map(r => r?.student_id).filter(Boolean)).size;
          } else {
            // fallback to profiles join with explicit alias attempts
            try {
              const { data: fallbackRows } = await supabase
                .from('class_enrollments')
                .select('profiles!student_id(id)')
                .in('class_id', courseIds);
              totalStudents = new Set((fallbackRows || []).map(r => r?.profiles?.id).filter(Boolean)).size;
            } catch (fbErr) {
              try {
                const { data: fallbackRows2 } = await supabase
                  .from('class_enrollments')
                  .select('profiles!user_id(id)')
                  .in('class_id', courseIds);
                totalStudents = new Set((fallbackRows2 || []).map(r => r?.profiles?.id).filter(Boolean)).size;
              } catch (fbErr2) {
                console.warn('⚠️ Could not compute total students via profiles join fallbacks:', fbErr2);
                totalStudents = 0;
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Could not compute total students via primary method, fallback will try profiles:', e);
          try {
            const { data: fallbackRows } = await supabase
              .from('class_enrollments')
              .select('profiles!student_id(id)')
              .in('class_id', courseIds);
            totalStudents = new Set((fallbackRows || []).map(r => r?.profiles?.id).filter(Boolean)).size;
          } catch (fbErr) {
            try {
              const { data: fallbackRows2 } = await supabase
                .from('class_enrollments')
                .select('profiles!user_id(id)')
                .in('class_id', courseIds);
              totalStudents = new Set((fallbackRows2 || []).map(r => r?.profiles?.id).filter(Boolean)).size;
            } catch (fbErr2) {
              console.warn('⚠️ Failed all fallbacks computing student totals:', fbErr2);
              totalStudents = 0;
            }
          }
        }
      }

      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .eq('lecturer_id', lecturerId);

      if (sessionsError) throw sessionsError;
      const sessionIds = sessions?.map(s => s.id) || [];
      const sessionCount = sessionIds.length;

      let attendanceCount = 0;
      if (sessionIds.length > 0) {
        const { count, error: attendanceError } = await supabase
          .from('attendance_logs')
          .select('id', { count: 'exact', head: true })
          .in('session_id', sessionIds);

        if (attendanceError) throw attendanceError;
        attendanceCount = count || 0;
      }

      const overallRate = sessionCount > 0 && totalStudents > 0
        ? Math.round(((attendanceCount || 0) / (sessionCount * totalStudents)) * 100)
        : 0;

      return {
        totalStudents,
        totalCourses,
        totalSessions: sessionCount || 0,
        overallRate: Math.min(100, overallRate),
      };
    } catch (error) {
      console.error('❌ Error calculating lecturer stats:', error);
      throw new Error('Failed to calculate statistics');
    }
  },

  async getSessionPerformance(sessionId, expectedStudents = 50) {
    try {
      const { count, error } = await supabase
        .from('attendance_logs')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) throw error;

      const studentsPresent = count || 0;
      const attendanceDensity = expectedStudents > 0
        ? Math.round((studentsPresent / expectedStudents) * 100)
        : 0;

      return {
        studentsPresent,
        expectedStudents,
        attendanceDensity: Math.min(100, attendanceDensity),
      };
    } catch (error) {
      console.error('❌ Error calculating session performance:', error);
      throw new Error('Failed to calculate performance');
    }
  },

  async getStudentStats(studentId) {
    try {
      let enrolledCount = 0;
      try {
        const { data: enrollRows, error: enrollErr } = await supabase
          .from('class_enrollments')
          .select('id')
          .eq('student_id', studentId)
          .eq('status', 'active');

        if (enrollErr) throw enrollErr;
        enrolledCount = (enrollRows || []).length;
      } catch (e) {
        console.warn('⚠️ Fallback when counting enrolled courses failed, defaulting to 0', e);
        enrolledCount = 0;
      }

      const { data: logs, error: logsError } = await supabase
        .from('attendance_logs')
        .select('session_id')
        .eq('student_id', studentId);

      if (logsError) throw logsError;

      const totalSessions = logs?.length || 0;

      const expectedSessions = enrolledCount * 2;
      const attendanceRate = expectedSessions > 0
        ? Math.round((totalSessions / expectedSessions) * 100)
        : 0;

      return {
        enrolledCourses: enrolledCount || 0,
        attendanceRate: Math.min(100, attendanceRate),
        totalSessions,
      };
    } catch (error) {
      console.error('❌ Error calculating student stats:', error);
      throw new Error('Failed to calculate student statistics');
    }
  },

  async getAttendanceTrendData(studentId, months = 6) {
    try {
      const { data: logs, error } = await supabase
        .from('attendance_logs')
        .select('signed_at')
        .eq('student_id', studentId);

      if (error) throw error;

      const monthlyData = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

      (logs || []).forEach(log => {
        const date = new Date(log.signed_at);
        const monthKey = monthNames[date.getMonth()] || 'Unknown';
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      return monthNames.slice(0, months).map(month => ({
        month,
        attendance: monthlyData[month] || 0,
      }));
    } catch (error) {
      console.error('❌ Error fetching attendance trend:', error);
      throw new Error('Failed to fetch attendance trend');
    }
  },
};
