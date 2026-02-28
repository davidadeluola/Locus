import { supabase } from '../api/supabase';

const trySelectWithFallbacks = async (baseQueryBuilder) => {
  // Attempt 1: explicit join using profiles!student_id and status filter
  try {
    const q = baseQueryBuilder()
      .select(`id, student_id, class_id, status, created_at, profiles!student_id(id, full_name, matric_no, email, department, level), classes!inner(id, course_code, course_title, lecturer_id)`)
      .eq('status', 'active');
    const { data, error } = await q;
    if (!error) return data || [];
    // fallthrough to next attempt
  } catch {
    // continue to fallback
  }

  // Attempt 2: explicit join using profiles!user_id (some schemas use user_id)
  try {
    const q2 = baseQueryBuilder()
      .select(`id, student_id, class_id, status, created_at, profiles!user_id(id, full_name, matric_no, email, department, level), classes!inner(id, course_code, course_title, lecturer_id)`)
      .eq('status', 'active');
    const { data: d2, error: e2 } = await q2;
    if (!e2) return d2 || [];
  } catch {
    // continue
  }

  // Final fallback: no status filter, still force explicit FK join
  try {
    const { data: finalData, error: finalErr } = await baseQueryBuilder()
      .select(`id, student_id, class_id, status, created_at, profiles!student_id(id, full_name, matric_no, email, department, level), classes!inner(id, course_code, course_title, lecturer_id)`)
      .eq('class_id', baseQueryBuilder._classId || undefined);
    if (finalErr) throw finalErr;
    return finalData || [];
  } catch (finalE) {
    console.error('❌ Error fetching enrollments (all fallbacks failed):', finalE);
    throw new Error('Failed to fetch enrollments');
  }
};

export const EnrollmentRepository = {
  async findByCourse(courseId) {
    const baseQuery = () => supabase.from('class_enrollments').eq('class_id', courseId).order('created_at', { ascending: true });
    // attach classId for the final fallback usage
    baseQuery._classId = courseId;
    return trySelectWithFallbacks(baseQuery);
  },

  async findByStudent(studentId) {
    const baseQuery = () => supabase.from('class_enrollments').eq('student_id', studentId).order('created_at', { ascending: false });
    baseQuery._classId = undefined;
    return trySelectWithFallbacks(baseQuery);
  },

  async countStudentsByCourse(courseId) {
    // Try counting with status first, fallback to counting without status
    try {
      const { count, error } = await supabase
        .from('class_enrollments')
        .select('student_id', { count: 'exact' })
        .eq('class_id', courseId)
        .eq('status', 'active');
      if (!error) return count || 0;
    } catch {
      // ignore and fallback
    }

    try {
      const { count: c2, error: e2 } = await supabase
        .from('class_enrollments')
        .select('student_id', { count: 'exact' })
        .eq('class_id', courseId);
      if (e2) {
        console.error('❌ Error counting enrollments (fallback):', e2);
        return 0;
      }
      return c2 || 0;
    } catch (error) {
      console.error('❌ Error counting enrollments (final):', error);
      return 0;
    }
  },

  async create(studentId, courseId) {
    const payload = { student_id: studentId, class_id: courseId, status: 'active' };
    try {
      const { data, error } = await supabase
        .from('class_enrollments')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch {
      // try inserting without the status field if DB doesn't have it
      try {
        const { data: d2, error: e2 } = await supabase
          .from('class_enrollments')
          .insert([{ student_id: studentId, class_id: courseId }])
          .select()
          .single();
        if (e2) throw e2;
        return d2;
      } catch (e3) {
        console.error('❌ Error creating enrollment:', e3);
        throw new Error('Failed to enroll student');
      }
    }
  },
};
