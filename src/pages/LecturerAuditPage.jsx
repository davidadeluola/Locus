import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Download, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../api/supabase";
import { useUser } from "../hooks/useUser";
import { formatDistance } from "../lib/utils/attendanceUtils";

const LecturerAuditPage = () => {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const sessionFilter = searchParams.get("sessionId");
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!user?.id) return;

      let query = supabase
        .from("attendance_logs")
        .select(
          `
            id,
            session_id,
            signed_at,
            distance_meters,
            profiles:student_id(full_name, matric_no),
            sessions!inner(id, lecturer_id, classes(course_code, course_title))
          `
        )
        .eq("sessions.lecturer_id", user.id)
        .order("signed_at", { ascending: false });

      if (sessionFilter) {
        query = query.eq("session_id", sessionFilter);
      }

      const { data } = await query;
      setAuditLogs(data || []);
    };

    fetchAuditLogs();
  }, [user?.id, sessionFilter]);

  const groupedSessions = useMemo(() => {
    const map = new Map();
    auditLogs.forEach((record) => {
      if (!map.has(record.session_id)) {
        map.set(record.session_id, {
          session_id: record.session_id,
          course_code: record.sessions?.classes?.course_code || "N/A",
          course_title: record.sessions?.classes?.course_title || "N/A",
          total: 0,
        });
      }
      map.get(record.session_id).total += 1;
    });
    return Array.from(map.values());
  }, [auditLogs]);

  const exportReport = () => {
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
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        {auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-mono text-sm">No audit logs available</p>
            <p className="text-xs text-zinc-600 mt-2">Attendance records will appear here as sessions are created</p>
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
                    Course
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Status
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
                    <td className="py-3 px-4">{log.profiles?.full_name || "Unknown"}</td>
                    <td className="py-3 px-4 font-mono text-xs">{log.sessions?.classes?.course_code || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500 uppercase font-mono">
                        Signed
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{formatDistance(log.distance_meters)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerAuditPage;
