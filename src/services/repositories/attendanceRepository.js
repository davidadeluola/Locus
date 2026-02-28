import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class AttendanceRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async log(payload) {
    const { data, error } = await this.client.from('attendance_logs').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async findBySession(sessionId) {
    const { data, error } = await this.client.from('attendance_logs').select('*').eq('session_id', sessionId);
    if (error) throw error;
    return data;
  }

  async findByStudent(studentId, opts = {}) {
    const q = this.client.from('attendance_logs').select(
      `
        id,
        signed_at,
        distance_meters,
        session_id,
        sessions (
          id,
          otp_secret,
          expires_at,
          created_at,
          class_id,
          classes (
            course_code,
            course_title
          )
        )
      `
    ).eq('student_id', studentId).order('signed_at', { ascending: false });

    if (opts.limit) q.limit(opts.limit);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
}
