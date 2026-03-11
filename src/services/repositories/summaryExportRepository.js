import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class SummaryExportRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findByLecturer(lecturerId, filters = {}) {
    let query = this.client
      .from('attendance_summary_files')
      .select('*')
      .eq('lecturer_id', lecturerId)
      .order('created_at', { ascending: false });

    if (filters.sessionId) {
      query = query.eq('session_id', filters.sessionId);
    }

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters.scope) {
      query = query.eq('scope', filters.scope);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async save(payload) {
    const { data, error } = await this.client
      .from('attendance_summary_files')
      .upsert(payload, { onConflict: 'export_key' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}