import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Download, Filter, Calendar, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../api/supabase";
// TODO(MIGRATE): Replace direct `supabase` usage with repository interfaces
// Use src/services/repositories/* to centralize data access.
import { useUser } from "../hooks/useUser";
import { formatDistance } from "../lib/utils/attendanceUtils";

const LecturerAuditPage = () => {
  const PAGE_SIZE = 10;
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const sessionFilter = searchParams.get("sessionId");
  const [auditLogs, setAuditLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summaryPage, setSummaryPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      const { data } = await supabase
        .from("sessions")
        .select(`
          id,
          created_at,
          expires_at,
          lecturer_id,
          class_id,
          classes(id, course_code, course_title, course_department )
        `)
        .eq("lecturer_id", user.id)
        .order("created_at", { ascending: false });

      const rows = data || [];
      setSessions(rows);
      return rows;
    };

    const fetchAuditLogs = async (sessionRows) => {
      const sessionIds = (sessionRows || []).map((session) => session.id).filter(Boolean);

      if (!sessionIds.length) {
        setAuditLogs([]);
        return;
      }

      // Preferred source: persisted audit records written on session termination
      let auditQuery = supabase
        .from("attendance_audit")
        .select("id, attendance_log_id, session_id, student_id, signed_at, distance_meters, created_at")
        .in("session_id", sessionIds)
        .order("signed_at", { ascending: false });

      if (sessionFilter) {
        auditQuery = auditQuery.eq("session_id", sessionFilter);
      }

      const { data: auditRows, error: auditError } = await auditQuery;

      if (!auditError && auditRows && auditRows.length) {
        const studentIds = Array.from(new Set(auditRows.map((row) => row.student_id).filter(Boolean)));
        let profileMap = new Map();

        if (studentIds.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, matric_no")
            .in("id", studentIds);

          profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
        }

        const sessionMap = new Map((sessionRows || []).map((session) => [session.id, session]));
        const normalized = auditRows.map((row) => {
          const profile = profileMap.get(row.student_id) || null;
          const session = sessionMap.get(row.session_id) || null;

          return {
            id: row.id,
            session_id: row.session_id,
            signed_at: row.signed_at,
            distance_meters: row.distance_meters,
            profiles: {
              full_name: profile?.full_name || "",
              matric_no: profile?.matric_no || "",
            },
            sessions: {
              id: session?.id,
              created_at: session?.created_at,
              expires_at: session?.expires_at,
              lecturer_id: session?.lecturer_id,
              classes: {
                course_code: session?.classes?.course_code || "",
                course_title: session?.classes?.course_title || "",
                course_department: session?.classes?.course_department || "",
              },
            },
          };
        });

        setAuditLogs(normalized);
        return;
      }

      // Fallback source: live attendance logs
      let logsQuery = supabase
        .from("attendance_logs")
        .select(
          `
            id,
            session_id,
            signed_at,
            distance_meters,
            profiles:student_id(full_name, matric_no),
            sessions!inner(id, created_at, expires_at, lecturer_id, classes(course_code, course_title, course_department))
          `
        )
        .eq("sessions.lecturer_id", user.id)
        .order("signed_at", { ascending: false });

      if (sessionFilter) {
        logsQuery = logsQuery.eq("session_id", sessionFilter);
      }

      const { data } = await logsQuery;
      setAuditLogs(data || []);
    };

    const fetchAll = async () => {
      const sessionRows = await fetchSessions();
      await fetchAuditLogs(sessionRows || []);
    };

    fetchAll();

    // Real-time subscription for persisted attendance audit
    const logsChannel = supabase
      .channel(`audit_logs_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_audit",
        },
        () => {
          fetchAll();
        }
      )
      .subscribe();

    // Real-time subscription for sessions
    const sessionsChannel = supabase
      .channel(`sessions_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `lecturer_id=eq.${user.id}`,
        },
        () => {
          fetchAll();
        }
      )
      .subscribe();

    return () => {
      logsChannel.unsubscribe();
      sessionsChannel.unsubscribe();
    };
  }, [user?.id, sessionFilter]);

  const groupedSessions = useMemo(() => {
    const map = new Map();
    sessions.forEach((session) => {
      if (!map.has(session.id)) {
        const sessionLogs = auditLogs.filter((log) => log.session_id === session.id);
        map.set(session.id, {
          session_id: session.id,
          course_code: session.classes?.course_code || "N/A",
          course_title: session.classes?.course_title || "N/A",
          created_at: session.created_at,
          total: sessionLogs.length,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [sessions, auditLogs]);

  const totalSummaryPages = Math.max(1, Math.ceil(groupedSessions.length / PAGE_SIZE));
  const paginatedGroupedSessions = useMemo(() => {
    const start = (summaryPage - 1) * PAGE_SIZE;
    return groupedSessions.slice(start, start + PAGE_SIZE);
  }, [groupedSessions, summaryPage]);

  const totalRecordPages = Math.max(1, Math.ceil(auditLogs.length / PAGE_SIZE));
  const paginatedAuditLogs = useMemo(() => {
    const start = (recordsPage - 1) * PAGE_SIZE;
    return auditLogs.slice(start, start + PAGE_SIZE);
  }, [auditLogs, recordsPage]);

  useEffect(() => {
    if (summaryPage > totalSummaryPages) setSummaryPage(totalSummaryPages);
  }, [summaryPage, totalSummaryPages]);

  useEffect(() => {
    if (recordsPage > totalRecordPages) setRecordsPage(totalRecordPages);
  }, [recordsPage, totalRecordPages]);

  const exportSessionReport = (sessionId) => {
    const sessionLogs = auditLogs.filter((log) => log.session_id === sessionId);
    if (!sessionLogs.length) return;

    const headers = ["session_id", "signed_at", "full_name", "matric_no", "course_code", "distance_meters"];
    const rows = sessionLogs.map((log) => [
      log.session_id,
      log.signed_at,
      log.profiles?.full_name || "",
      log.profiles?.matric_no || "",
      log.sessions?.classes?.course_code || "",
      log.distance_meters ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `attendance_audit_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportAllReport = () => {
    if (!auditLogs.length) return;
    const headers = ["session_id", "signed_at", "full_name", "matric_no", "course_code", "distance_meters"];
    const rows = auditLogs.map((log) => [
      log.session_id,
      log.signed_at,
      log.profiles?.full_name || "",
      log.profiles?.matric_no || "",
      log.sessions?.classes?.course_code || "",
      log.distance_meters ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `attendance_audit_${sessionFilter || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportSummaryReport = () => {
    if (!groupedSessions.length) return;
    const headers = ['s/n', 'filename', 'attendant_count', 'date'];
    const rows = groupedSessions.map((s, idx) => {
      const filename = `${(s.course_title || 'course').replace(/\s+/g, '_')}_attendance.xls`;
      return [idx + 1, filename, s.total || 0, s.created_at || ''];
    });

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `attendance_summary_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ShieldCheck className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Attendance Audit</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">Review and verify attendance records</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl uppercase text-xs tracking-widest">
          <Filter size={18} />
          {sessionFilter ? `Session: ${sessionFilter.slice(0, 8)}...` : `Sessions: ${groupedSessions.length}`}
        </button>
        <div className="flex gap-2">
          <button
            onClick={exportAllReport}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest"
          >
            <Download size={18} />
            Export All
          </button>
          <button
            onClick={() => exportSummaryReport()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest"
          >
            <Download size={18} />
            Export Summary
          </button>
        </div>
      </div>

      {/* Session Summary Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Calendar className="text-orange-500" size={20} />
          </div>
          <h3 className="font-mono text-sm uppercase tracking-widest">
            Session Summary
          </h3>
        </div>

        {groupedSessions.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-mono text-sm">No sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    S/N
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Course Title
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Course Code
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Students Registered
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedGroupedSessions.map((session, index) => (
                  <tr key={session.session_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all">
                    <td className="py-3 px-4 font-mono text-xs text-zinc-300">
                      {(summaryPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm">{session.course_title}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-300">{session.course_code}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg font-mono text-xs border border-orange-500/20">
                        <Users size={12} />
                        {session.total}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-300">
                      {new Date(session.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => exportSessionReport(session.session_id)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all text-xs uppercase font-mono"
                      >
                        <Download size={12} />
                        CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalSummaryPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setSummaryPage((page) => Math.max(1, page - 1))}
                  disabled={summaryPage === 1}
                  className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-mono text-zinc-500">Page {summaryPage} / {totalSummaryPages}</span>
                <button
                  onClick={() => setSummaryPage((page) => Math.min(totalSummaryPages, page + 1))}
                  disabled={summaryPage === totalSummaryPages}
                  className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Attendance Logs */}
      {!sessionFilter && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="font-mono text-sm uppercase tracking-widest mb-6">All Attendance Records</h3>
          {auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={48} />
              <p className="text-zinc-500 font-mono text-sm">No audit logs available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                      Matric
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                      Distance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAuditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all">
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">{new Date(log.signed_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm">{log.profiles?.full_name || "Unknown"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">{log.profiles?.matric_no || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-xs">{log.sessions?.classes?.course_code || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-emerald-500">{formatDistance(log.distance_meters)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalRecordPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setRecordsPage((page) => Math.max(1, page - 1))}
                    disabled={recordsPage === 1}
                    className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-mono text-zinc-500">Page {recordsPage} / {totalRecordPages}</span>
                  <button
                    onClick={() => setRecordsPage((page) => Math.min(totalRecordPages, page + 1))}
                    disabled={recordsPage === totalRecordPages}
                    className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filtered Session Details */}
      {sessionFilter && auditLogs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="font-mono text-sm uppercase tracking-widest mb-6">Session Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Student Name
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Matric No
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-800/50">
                    <td className="py-3 px-4 font-mono text-xs">{new Date(log.signed_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{log.profiles?.full_name || "Unknown"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{log.profiles?.matric_no || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-500">{formatDistance(log.distance_meters)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerAuditPage;
