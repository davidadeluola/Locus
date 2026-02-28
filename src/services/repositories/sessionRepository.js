import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class SessionRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findById(id) {
    const { data, error } = await this.client.from('sessions').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(payload) {
    const { data, error } = await this.client.from('sessions').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async findActiveByLecturer(lecturerId) {
    const nowIso = new Date().toISOString();
    const { data, error } = await this.client
      .from('sessions')
      .select('id, class_id, lecturer_id, otp_secret, latitude, longitude, expires_at, created_at')
      .eq('lecturer_id', lecturerId)
      .gt('expires_at', nowIso)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async findActiveByOtp(otp) {
    const nowIso = new Date().toISOString();
    const { data, error } = await this.client
      .from('sessions')
      .select('id, class_id, lecturer_id, otp_secret, latitude, longitude, expires_at')
      .eq('otp_secret', otp)
      .gt('expires_at', nowIso)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async update(id, payload) {
    const { data, error } = await this.client.from('sessions').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  /**
   * Finalize a session: attempt to copy attendance logs to an audit table and mark session archived.
   * This is best-effort: if `attendance_audit` doesn't exist the errors are swallowed.
   */
  async finalizeSession(id) {
    try {
      const { data: logs, error: fetchErr } = await this.client.from('attendance_logs').select('*').eq('session_id', id);
      if (fetchErr) {
        // nothing to do
      } else if (logs && logs.length) {
        const auditRows = logs.map((l) => ({
          attendance_log_id: l.id,
          session_id: l.session_id,
          student_id: l.student_id,
          signed_at: l.signed_at,
          distance_meters: l.distance_meters,
          metadata: l.metadata || null,
          created_at: new Date().toISOString(),
        }));
        try {
          await this.client.from('attendance_audit').insert(auditRows);
        } catch (insertErr) {
          // best-effort: ignore if table doesn't exist or insert fails
          // eslint-disable-next-line no-console
          console.warn('sessionRepository.finalizeSession: insert to attendance_audit failed', insertErr.message || insertErr);
        }
      }

      // mark session archived
      try {
        const { data, error } = await this.client.from('sessions').update({ archived_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('sessionRepository.finalizeSession: failed to mark session archived', error.message || error);
        } else {
          return data;
        }
      } catch (e) {
        // ignore
      }
      return null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('sessionRepository.finalizeSession failed', e);
      return null;
    }
  }
}
