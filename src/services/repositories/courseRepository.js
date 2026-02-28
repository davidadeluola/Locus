import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class CourseRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }
  // The project stores course records in the `classes` table.
  async findAll() {
    const { data, error } = await this.client.from('classes').select('*');
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.client.from('classes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findByLecturer(lecturerId) {
    const { data, error } = await this.client
      .from('classes')
      .select('id, course_code, course_title, level, created_at, department')
      .eq('lecturer_id', lecturerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findAvailableForStudent(studentId) {
    const { data: classes, error: classError } = await this.client
      .from('classes')
      .select('id, lecturer_id, course_code, course_title, level, created_at, department, profiles:lecturer_id(full_name)')
      .order('created_at', { ascending: false });

    if (classError) throw classError;

    const { data: enrollments, error: enrollmentError } = await this.client
      .from('class_enrollments')
      .select('class_id')
      .eq('student_id', studentId);

    if (enrollmentError) throw enrollmentError;

    const enrolledClassIds = new Set((enrollments || []).map((item) => item.class_id));
    return (classes || []).filter((klass) => !enrolledClassIds.has(klass.id));
  }

  async create(payload) {
    const { data, error } = await this.client.from('classes').insert(payload).select('id, course_code, course_title, level, created_at, department').single();
    if (error) throw error;
    return data;
  }

  async update(id, payload) {
    const { data, error } = await this.client.from('classes').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await this.client.from('classes').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}
