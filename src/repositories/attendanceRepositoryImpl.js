import { supabase } from '../api/supabase';

export const AttendanceRepository = {
  async findBySession(sessionId) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select(`
        id,
        student_id,
        session_id,
        signed_at,
        distance_meters,
        profiles:student_id(id, full_name, matric_no, email, department, level),
        sessions!inner(id, class_id, classes(id, course_code, course_title))
      `)
      .eq('session_id', sessionId)
      .order('signed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching session attendance:', error);
      throw new Error('Failed to fetch attendance logs');
    }

    return data || [];
  },

  async findByStudent(studentId, options = {}) {
    const { limit = 50 } = options;
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`*, profiles!student_id(full_name, matric_no), sessions!inner(id, class_id, classes(id, course_code, course_title))`)
        .eq('student_id', studentId)
        .order('signed_at', { ascending: false })
        .limit(limit);

      if (error) {
        // If ambiguous relationship error, return empty array to avoid crashing callers
        if (error && error.code === 'PGRST201') {
          console.warn('⚠️ attendanceRepository.findByStudent: ambiguous relationship (PGRST201), returning empty array');
          return [];
        }
        console.error('❌ Error fetching student attendance:', error);
        throw new Error('Failed to fetch attendance logs');
      }

      return data || [];
    } catch (err) {
      // Surface ambiguous relationship as empty array; rethrow other errors
      if (err && err.code === 'PGRST201') {
        console.warn('⚠️ attendanceRepository.findByStudent caught PGRST201, returning []');
        return [];
      }
      console.error('❌ attendanceRepository.findByStudent unexpected error:', err);
      throw err;
    }
  },

  async countBySession(sessionId) {
    const { count, error } = await supabase
      .from('attendance_logs')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Error counting attendance:', error);
      return 0;
    }

    return count || 0;
  },

  async create(data) {
    const { data: log, error } = await supabase
      .from('attendance_logs')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Error recording attendance:', error);
      throw new Error('Failed to record attendance');
    }

    return log;
  },

  async exists(studentId, sessionId) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('student_id', studentId)
      .eq('session_id', sessionId)
      .single();

    if (error && error.code === 'PGRST116') return false;
    return !!data;
  },
};
