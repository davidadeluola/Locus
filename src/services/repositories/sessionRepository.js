import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';
import SummaryExportRepository from './summaryExportRepository.js';
import { buildCsvContent } from '../../lib/utils/fileExports.js';

export default class SessionRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
    this.summaryExportRepository = new SummaryExportRepository({ supabaseClient: this.client });
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
   * This is best-effort: if backing tables don't exist the errors are swallowed.
   */
  async finalizeSession(id) {
    try {
      const { data: logs, error: fetchErr } = await this.client.from('attendance_logs').select('*').eq('session_id', id);
      const safeLogs = logs || [];

      if (fetchErr) {
        // nothing to do
      } else if (safeLogs.length) {
        let existingAuditLogIds = new Set();

        try {
          const { data: existingAuditRows, error: existingAuditError } = await this.client
            .from('attendance_audit')
            .select('attendance_log_id')
            .eq('session_id', id);

          if (!existingAuditError) {
            existingAuditLogIds = new Set((existingAuditRows || []).map((row) => row.attendance_log_id).filter(Boolean));
          }
        } catch {
          // ignore lookup failure and fall through to best-effort insert
        }

        const auditRows = safeLogs
          .filter((log) => !existingAuditLogIds.has(log.id))
          .map((l) => ({
          attendance_log_id: l.id,
          session_id: l.session_id,
          student_id: l.student_id,
          signed_at: l.signed_at,
          distance_meters: l.distance_meters,
          metadata: l.metadata || null,
          created_at: new Date().toISOString(),
        }));

        if (auditRows.length) {
          try {
            await this.client.from('attendance_audit').insert(auditRows);
          } catch (insertErr) {
            // best-effort: ignore if table doesn't exist or insert fails
            console.warn('sessionRepository.finalizeSession: insert to attendance_audit failed', insertErr.message || insertErr);
          }
        }
      }

      await this.persistSummaryFile(id, safeLogs);

      // mark session archived
      try {
        const { data, error } = await this.client.from('sessions').update({ archived_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) {
          console.warn('sessionRepository.finalizeSession: failed to mark session archived', error.message || error);
        } else {
          return data;
        }
      } catch {
        // ignore
      }
      return null;
    } catch (e) {
      console.warn('sessionRepository.finalizeSession failed', e);
      return null;
    }
  }

  async persistSummaryFile(id, logs = []) {
    try {
      const { data: sessionRow, error } = await this.client
        .from('sessions')
        .select(`
          id,
          lecturer_id,
          class_id,
          created_at,
          expires_at,
          classes(id, course_code, course_title, department)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !sessionRow?.lecturer_id) {
        return null;
      }

      const attendanceCount = new Set((logs || []).map((log) => log.student_id).filter(Boolean)).size;
      const courseTitle = sessionRow.classes?.course_title || 'session';
      const filename = `${courseTitle.replace(/\s+/g, '_')}_attendance_summary.xls`;
      const summaryDate = sessionRow.created_at || new Date().toISOString();
      const contentText = buildCsvContent(
        ['s/n', 'filename', 'attendant_count', 'date'],
        [[1, filename, attendanceCount, summaryDate]]
      );

      return await this.summaryExportRepository.save({
        export_key: `session:${id}:finalize`,
        lecturer_id: sessionRow.lecturer_id,
        session_id: id,
        class_id: sessionRow.class_id || null,
        scope: 'session',
        source: 'finalize',
        filename,
        mime_type: 'application/vnd.ms-excel',
        file_extension: 'xls',
        content_text: contentText,
        row_count: 1,
        summary_date: summaryDate,
        metadata: {
          course_code: sessionRow.classes?.course_code || '',
          course_title: sessionRow.classes?.course_title || courseTitle,
          course_department: sessionRow.classes?.department || '',
          attendant_count: attendanceCount,
        },
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('sessionRepository.finalizeSession: failed to persist summary file', error?.message || error);
      return null;
    }
  }
}
