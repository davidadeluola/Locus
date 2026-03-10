import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class AuditRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findSessionsByLecturer(lecturerId) {
    const { data, error } = await this.client
      .from('sessions')
      .select(`
        id,
        created_at,
        expires_at,
        archived_at,
        lecturer_id,
        class_id,
        classes(id, course_code, course_title, department, course_department)
      `)
      .eq('lecturer_id', lecturerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findPersistedLogs(sessionIds = [], { sessionId } = {}) {
    if (!sessionIds.length) return [];

    let query = this.client
      .from('attendance_audit')
      .select('id, attendance_log_id, session_id, student_id, signed_at, distance_meters, created_at')
      .in('session_id', sessionIds)
      .order('signed_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findProfilesByIds(profileIds = []) {
    if (!profileIds.length) return [];

    const { data, error } = await this.client
      .from('profiles')
      .select('id, full_name, matric_no')
      .in('id', profileIds);

    if (error) throw error;
    return data || [];
  }

  async findLiveLogsByLecturer(lecturerId, { sessionId } = {}) {
    let query = this.client
      .from('attendance_logs')
      .select(`
        id,
        session_id,
        student_id,
        signed_at,
        distance_meters,
        profiles:student_id(id, full_name, matric_no),
        sessions!inner(
          id,
          created_at,
          expires_at,
          archived_at,
          lecturer_id,
          class_id,
          classes(id, course_code, course_title, department, course_department)
        )
      `)
      .eq('sessions.lecturer_id', lecturerId)
      .order('signed_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}