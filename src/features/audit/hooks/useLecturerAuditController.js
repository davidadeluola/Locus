import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../api/supabase.js';
import { useUser } from '../../../hooks/useUser';
import { buildCsvContent, downloadTextFile } from '../../../lib/utils/fileExports.js';
import notify from '../../../services/notify.jsx';
import summaryExportService from '../../../services/domain/summaryExportService.js';
import {
  auditRepository,
  courseRepository,
  summaryExportRepository,
} from '../../../services/repositories/index.js';

function normalizePersistedLogs(auditRows, sessionRows, profileRows) {
  const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]));
  const sessionMap = new Map((sessionRows || []).map((session) => [session.id, session]));

  return (auditRows || []).map((row) => {
    const profile = profileMap.get(row.student_id) || null;
    const session = sessionMap.get(row.session_id) || null;

    return {
      id: row.id,
      session_id: row.session_id,
      student_id: row.student_id,
      signed_at: row.signed_at,
      distance_meters: row.distance_meters,
      profiles: {
        full_name: profile?.full_name || '',
        matric_no: profile?.matric_no || '',
      },
      sessions: {
        id: session?.id || row.session_id,
        class_id: session?.class_id || null,
        created_at: session?.created_at || row.created_at,
        expires_at: session?.expires_at || null,
        archived_at: session?.archived_at || null,
        lecturer_id: session?.lecturer_id || null,
        classes: {
          id: session?.classes?.id || session?.class_id || null,
          course_code: session?.classes?.course_code || '',
          course_title: session?.classes?.course_title || '',
          course_department: session?.classes?.course_department || session?.classes?.department || '',
        },
      },
    };
  });
}

function normalizeLiveLogs(logs) {
  return (logs || []).map((log) => ({
    id: log.id,
    session_id: log.session_id,
    student_id: log.student_id,
    signed_at: log.signed_at,
    distance_meters: log.distance_meters,
    profiles: {
      full_name: log.profiles?.full_name || '',
      matric_no: log.profiles?.matric_no || '',
    },
    sessions: {
      id: log.sessions?.id || log.session_id,
      class_id: log.sessions?.class_id || null,
      created_at: log.sessions?.created_at || null,
      expires_at: log.sessions?.expires_at || null,
      archived_at: log.sessions?.archived_at || null,
      lecturer_id: log.sessions?.lecturer_id || null,
      classes: {
        id: log.sessions?.classes?.id || log.sessions?.class_id || null,
        course_code: log.sessions?.classes?.course_code || '',
        course_title: log.sessions?.classes?.course_title || '',
        course_department: log.sessions?.classes?.course_department || log.sessions?.classes?.department || '',
      },
    },
  }));
}

function sanitizeFileName(value) {
  return (value || 'attendance').replace(/\s+/g, '_');
}

export default function useLecturerAuditController() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summaryFiles, setSummaryFiles] = useState([]);

  const sessionFilter = searchParams.get('sessionId') || '';
  const classFilter = searchParams.get('classId') || '';

  const loadAuditData = useCallback(async () => {
    if (!user?.id) {
      setAuditLogs([]);
      setSessions([]);
      setClasses([]);
      setSummaryFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [classResult, sessionResult, summaryResult] = await Promise.allSettled([
        courseRepository.findByLecturer(user.id),
        auditRepository.findSessionsByLecturer(user.id),
        summaryExportRepository.findByLecturer(user.id),
      ]);

      if (sessionResult.status !== 'fulfilled') {
        throw sessionResult.reason;
      }

      const nextClasses = classResult.status === 'fulfilled' ? classResult.value : [];
      const nextSessions = sessionResult.value || [];
      const nextSummaryFiles = summaryResult.status === 'fulfilled' ? summaryResult.value : [];

      setClasses(nextClasses);
      setSessions(nextSessions);
      setSummaryFiles(nextSummaryFiles);

      const sessionIds = nextSessions.map((session) => session.id).filter(Boolean);
      if (!sessionIds.length) {
        setAuditLogs([]);
        return;
      }

      try {
        const persistedLogs = await auditRepository.findPersistedLogs(sessionIds, {
          sessionId: sessionFilter || undefined,
        });

        if (persistedLogs.length) {
          const profileIds = Array.from(new Set(persistedLogs.map((row) => row.student_id).filter(Boolean)));
          const profiles = await auditRepository.findProfilesByIds(profileIds);
          setAuditLogs(normalizePersistedLogs(persistedLogs, nextSessions, profiles));
          return;
        }
      } catch (persistedError) {
        console.warn('useLecturerAuditController: persisted audit load failed', persistedError?.message || persistedError);
      }

      const liveLogs = await auditRepository.findLiveLogsByLecturer(user.id, {
        sessionId: sessionFilter || undefined,
      });
      setAuditLogs(normalizeLiveLogs(liveLogs));
    } catch (error) {
      notify.error(error?.message || 'Failed to load attendance audit');
    } finally {
      setLoading(false);
    }
  }, [sessionFilter, user?.id]);

  useEffect(() => {
    void loadAuditData();
  }, [loadAuditData]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const refresh = () => {
      void loadAuditData();
    };

    const auditChannel = supabase
      .channel(`attendance_audit_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_audit' }, refresh)
      .subscribe();

    const liveLogsChannel = supabase
      .channel(`attendance_logs_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs' }, refresh)
      .subscribe();

    const sessionsChannel = supabase
      .channel(`sessions_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `lecturer_id=eq.${user.id}`,
        },
        refresh
      )
      .subscribe();

    const summaryFilesChannel = supabase
      .channel(`attendance_summary_files_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_summary_files',
          filter: `lecturer_id=eq.${user.id}`,
        },
        refresh
      )
      .subscribe();

    return () => {
      auditChannel.unsubscribe();
      liveLogsChannel.unsubscribe();
      sessionsChannel.unsubscribe();
      summaryFilesChannel.unsubscribe();
    };
  }, [loadAuditData, user?.id]);

  const classOptions = useMemo(() => {
    const classMap = new Map();

    classes.forEach((klass) => {
      classMap.set(klass.id, {
        id: klass.id,
        course_code: klass.course_code || 'N/A',
        course_title: klass.course_title || 'Untitled Class',
      });
    });

    sessions.forEach((session) => {
      const classId = session.class_id || session.classes?.id;
      if (!classId || classMap.has(classId)) return;

      classMap.set(classId, {
        id: classId,
        course_code: session.classes?.course_code || 'N/A',
        course_title: session.classes?.course_title || 'Untitled Class',
      });
    });

    return Array.from(classMap.values()).sort((first, second) => {
      return first.course_title.localeCompare(second.course_title);
    });
  }, [classes, sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSession = !sessionFilter || session.id === sessionFilter;
      const matchesClass = !classFilter || session.class_id === classFilter;
      return matchesSession && matchesClass;
    });
  }, [classFilter, sessionFilter, sessions]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const logClassId = log.sessions?.class_id || log.sessions?.classes?.id || null;
      const matchesSession = !sessionFilter || log.session_id === sessionFilter;
      const matchesClass = !classFilter || logClassId === classFilter;
      return matchesSession && matchesClass;
    });
  }, [auditLogs, classFilter, sessionFilter]);

  const groupedSessions = useMemo(() => {
    return filteredSessions
      .map((session) => {
        const sessionLogs = filteredAuditLogs.filter((log) => log.session_id === session.id);

        return {
          session_id: session.id,
          class_id: session.class_id || session.classes?.id || null,
          course_code: session.classes?.course_code || 'N/A',
          course_title: session.classes?.course_title || 'N/A',
          created_at: session.created_at,
          total: sessionLogs.length,
        };
      })
      .sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
  }, [filteredAuditLogs, filteredSessions]);

  const filteredSummaryFiles = useMemo(() => {
    return summaryFiles.filter((file) => {
      const matchesSession = !sessionFilter || file.session_id === sessionFilter;
      const matchesClass = !classFilter || file.class_id === classFilter;
      return matchesSession && matchesClass;
    });
  }, [classFilter, sessionFilter, summaryFiles]);

  const activeClass = classOptions.find((klass) => klass.id === classFilter) || null;

  const setClassFilter = useCallback((nextClassId) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextClassId) {
      nextParams.set('classId', nextClassId);
    } else {
      nextParams.delete('classId');
    }

    nextParams.delete('sessionId');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('classId');
    nextParams.delete('sessionId');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const exportSessionReport = useCallback((sessionId) => {
    const sessionLogs = auditLogs.filter((log) => log.session_id === sessionId);
    if (!sessionLogs.length) return;

    const rows = sessionLogs.map((log) => [
      log.session_id,
      log.signed_at,
      log.profiles?.full_name || '',
      log.profiles?.matric_no || '',
      log.sessions?.classes?.course_code || '',
      log.distance_meters ?? '',
    ]);

    downloadTextFile({
      content: buildCsvContent(
        ['session_id', 'signed_at', 'full_name', 'matric_no', 'course_code', 'distance_meters'],
        rows
      ),
      filename: `attendance_audit_${sessionId}.csv`,
    });
  }, [auditLogs]);

  const exportAllReport = useCallback(() => {
    if (!filteredAuditLogs.length) return;

    const rows = filteredAuditLogs.map((log) => [
      log.session_id,
      log.signed_at,
      log.profiles?.full_name || '',
      log.profiles?.matric_no || '',
      log.sessions?.classes?.course_code || '',
      log.distance_meters ?? '',
    ]);

    const scopeLabel = sessionFilter || classFilter || 'all';
    downloadTextFile({
      content: buildCsvContent(
        ['session_id', 'signed_at', 'full_name', 'matric_no', 'course_code', 'distance_meters'],
        rows
      ),
      filename: `attendance_audit_${scopeLabel}.csv`,
    });
  }, [classFilter, filteredAuditLogs, sessionFilter]);

  const exportSummaryReport = useCallback(async () => {
    if (!groupedSessions.length || !user?.id) return;

    const rows = groupedSessions.map((session, index) => [
      index + 1,
      `${sanitizeFileName(session.course_title)}_attendance.xls`,
      session.total || 0,
      session.created_at || '',
    ]);

    try {
      await summaryExportService.saveAndDownloadCsvFile({
        exportKey: sessionFilter
          ? `session:${sessionFilter}:manual-summary`
          : classFilter
            ? `class:${classFilter}:manual-summary`
            : `lecturer:${user.id}:manual-summary`,
        lecturerId: user.id,
        sessionId: sessionFilter || null,
        classId: classFilter || null,
        scope: sessionFilter ? 'session' : classFilter ? 'class' : 'all',
        source: 'manual',
        filename: sessionFilter
          ? `${sanitizeFileName(groupedSessions[0]?.course_title || 'session')}_attendance_summary.xls`
          : classFilter
            ? `${sanitizeFileName(activeClass?.course_title || activeClass?.course_code || 'class')}_attendance_summary.xls`
            : `attendance_summary_${new Date().toISOString().slice(0, 10)}.xls`,
        mimeType: 'application/vnd.ms-excel',
        fileExtension: 'xls',
        headers: ['s/n', 'filename', 'attendant_count', 'date'],
        rows,
        summaryDate: new Date().toISOString(),
        metadata: {
          course_code: activeClass?.course_code || '',
          course_title: activeClass?.course_title || '',
          session_count: groupedSessions.length,
          filters: {
            session_id: sessionFilter || null,
            class_id: classFilter || null,
          },
        },
      });

      notify.success('Summary exported and saved');
    } catch (error) {
      notify.error(error?.message || 'Failed to export summary');
    }
  }, [activeClass?.course_code, activeClass?.course_title, classFilter, groupedSessions, sessionFilter, user?.id]);

  const downloadSummaryFile = useCallback((file) => {
    summaryExportService.downloadStoredFile(file);
  }, []);

  return {
    loading,
    sessionFilter,
    classFilter,
    classOptions,
    groupedSessions,
    filteredAuditLogs,
    filteredSummaryFiles,
    clearFilters,
    setClassFilter,
    exportAllReport,
    exportSessionReport,
    exportSummaryReport,
    downloadSummaryFile,
  };
}