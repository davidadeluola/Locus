import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class EnrollmentRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findByCourse(courseId) {
    const { data, error } = await this.client.from('enrollments').select('*').eq('course_id', courseId);
    if (error) throw error;
    return data;
  }

  async findByStudent(studentId) {
    const { data, error } = await this.client
      .from('class_enrollments')
      .select(
        `
          id,
          class_id,
          created_at,
          classes (
            id,
            course_code,
            course_title,
            lecturer_id,
            profiles:lecturer_id (full_name)
          ),
          profiles:student_id (id, full_name, matric_no, email, department, level)
        `
      )
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByLecturer(lecturerId) {
    const { data, error } = await this.client
      .from('class_enrollments')
      .select(
        `
          id,
          class_id,
          student_id,
          created_at,
          classes!inner(id, course_code, course_title, lecturer_id),
          profiles:student_id (id, full_name, matric_no, email, department, level)
        `
      )
      .eq('classes.lecturer_id', lecturerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(payload) {
    const { data, error } = await this.client.from('enrollments').insert(payload).select().single();
    if (error) throw error;
    return data;
  }
}
