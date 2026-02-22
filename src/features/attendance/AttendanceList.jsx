import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Users, Clock, MapPin, TrendingUp, Download, BookOpen } from "lucide-react";
import { supabase } from "../../api/supabase";
import { formatDistance } from "../../lib/utils/attendanceUtils";

const AttendanceList = ({ sessionId }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgDistance: 0,
  });

  const fetchSessionInfo = useCallback(async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
          id,
          class_id,
          created_at,
          expires_at,
          classes (
            id,
            course_code,
            course_title
          )
        `
      )
      .eq("id", sessionId)
      .single();

    if (error) throw error;
    setSessionInfo(data || null);

    if (!data?.class_id) {
      setEnrolledStudents([]);
      return;
    }

    const { data: classEnrollments, error: classEnrollmentsError } = await supabase
      .from("class_enrollments")
      .select(
        `
          id,
          student_id,
          created_at,
          profiles:student_id (
            id,
            full_name,
            matric_no,
            email,
            department,
            level
          )
        `
      )
      .eq("class_id", data.class_id)
      .order("created_at", { ascending: true });

    if (classEnrollmentsError) throw classEnrollmentsError;
    setEnrolledStudents(classEnrollments || []);
  }, [sessionId]);

  // Fetch initial attendance records
  const fetchAttendance = useCallback(async () => {
    try {
      const { data: logs, error } = await supabase
        .from("attendance_logs")
        .select(
          `
          id,
          signed_at,
          distance_meters,
          student_id,
          profiles:student_id (
            id,
            full_name,
            matric_no
          )
        `
        )
        .eq("session_id", sessionId)
        .order("signed_at", { ascending: true });

      if (error) throw error;

      setAttendanceRecords(logs || []);
      calculateStats(logs || []);

      await fetchSessionInfo();
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchSessionInfo]);

  // Calculate statistics
  const calculateStats = (records) => {
    const total = records.length;
    const avgDistance =
      total > 0
        ? records.reduce((sum, record) => sum + record.distance_meters, 0) / total
        : 0;

    setStats({ total, avgDistance });
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchAttendance();

    // Subscribe to new attendance logs
    const channel = supabase
      .channel(`attendance_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_logs",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          // Fetch the complete record with profile data
          const { data: newRecord } = await supabase
            .from("attendance_logs")
            .select(
              `
              id,
              signed_at,
              distance_meters,
              student_id,
              profiles:student_id (
                id,
                full_name,
                matric_no
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newRecord) {
            setAttendanceRecords((prev) => {
              const updated = [...prev, newRecord];
              calculateStats(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchAttendance]);

  useEffect(() => {
    if (!sessionInfo?.class_id) return;

    const enrollmentChannel = supabase
      .channel(`class_enrollments_${sessionInfo.class_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "class_enrollments",
          filter: `class_id=eq.${sessionInfo.class_id}`,
        },
        async (payload) => {
          const { data: newEnrollment } = await supabase
            .from("class_enrollments")
            .select(
              `
                id,
                student_id,
                created_at,
                profiles:student_id (
                  id,
                  full_name,
                  matric_no,
                  email,
                  department,
                  level
                )
              `
            )
            .eq("id", payload.new.id)
            .maybeSingle();

          if (!newEnrollment) return;

          setEnrolledStudents((previous) => {
            if (previous.some((item) => item.id === newEnrollment.id)) {
              return previous;
            }
            return [...previous, newEnrollment];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(enrollmentChannel);
    };
  }, [sessionInfo?.class_id]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDepartmentSummary = () => {
    const departments = enrolledStudents
      .map((item) => item.profiles?.department)
      .filter(Boolean);

    if (!departments.length) return "N/A";

    const freq = departments.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getLevelSummary = () => {
    const levels = enrolledStudents
      .map((item) => item.profiles?.level)
      .filter((value) => value !== null && value !== undefined);

    if (!levels.length) return "N/A";

    const freq = levels.reduce((acc, value) => {
      const key = String(value);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  };

  const exportSessionCsv = () => {
    if (!sessionInfo?.id || !enrolledStudents.length) return;

    const attendanceByStudent = attendanceRecords.reduce((acc, record) => {
      acc[record.student_id] = record;
      return acc;
    }, {});

    const headers = [
      "course_code",
      "course_title",
      "department",
      "level",
      "session_id",
      "session_start",
      "session_expires",
      "student_id",
      "full_name",
      "matric_no",
      "email",
      "student_department",
      "student_level",
      "signed_status",
      "signed_at",
      "distance_meters",
    ];

    const rows = enrolledStudents.map((enrollment) => {
      const profile = enrollment.profiles || {};
      const signedRecord = attendanceByStudent[enrollment.student_id] || null;

      return [
        sessionInfo?.classes?.course_code || "N/A",
        sessionInfo?.classes?.course_title || "N/A",
        getDepartmentSummary(),
        getLevelSummary(),
        sessionInfo.id,
        sessionInfo.created_at || "",
        sessionInfo.expires_at || "",
        enrollment.student_id || "",
        profile.full_name || "",
        profile.matric_no || "",
        profile.email || "",
        profile.department || "",
        profile.level ?? "",
        signedRecord ? "SIGNED" : "PENDING",
        signedRecord?.signed_at || "",
        signedRecord?.distance_meters ?? "",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `${sessionInfo?.classes?.course_code || "session"}_${sessionInfo.id}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-500 font-mono text-sm">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-orange-500" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-zinc-300">
                Session Class Context
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-500">
              Course: <span className="text-zinc-300">{sessionInfo?.classes?.course_code || "N/A"}</span> — {sessionInfo?.classes?.course_title || "Untitled Course"}
            </p>
            <p className="text-xs font-mono text-zinc-500">
              Department: <span className="text-zinc-300">{getDepartmentSummary()}</span>
            </p>
            <p className="text-xs font-mono text-zinc-500">
              Level: <span className="text-zinc-300">{getLevelSummary()}</span>
            </p>
            <p className="text-xs font-mono text-zinc-600">
              Session Window: {formatDateTime(sessionInfo?.created_at)} → {formatDateTime(sessionInfo?.expires_at)}
            </p>
          </div>

          <button
            type="button"
            onClick={exportSessionCsv}
            disabled={!enrolledStudents.length}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs uppercase font-mono hover:bg-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export Session CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-orange-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-xs text-zinc-500 mt-1">Students signed in</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-emerald-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Average</span>
          </div>
          <p className="text-3xl font-bold">{formatDistance(stats.avgDistance)}</p>
          <p className="text-xs text-zinc-500 mt-1">Distance from source</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Enrolled Students for Class
          </h4>
          <span className="text-xs font-mono text-zinc-600">
            {enrolledStudents.length} enrolled
          </span>
        </div>

        {enrolledStudents.length === 0 ? (
          <p className="text-xs text-zinc-500 font-mono">No enrolled students found for this class.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">S/N</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Full Name</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Matric No</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Department</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Level</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student, index) => {
                  const hasSigned = attendanceRecords.some((record) => record.student_id === student.student_id);
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-zinc-500">{String(index + 1).padStart(2, "0")}</td>
                      <td className="py-3 px-4 text-sm text-zinc-200">{student.profiles?.full_name || "Unknown Student"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.matric_no || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.department || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.level || "N/A"}</td>
                      <td className="py-3 px-4">
                        {hasSigned ? (
                          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500 uppercase font-mono">
                            Signed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500 uppercase font-mono">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="text-orange-500" size={20} />
          </div>
          <h3 className="font-mono text-sm uppercase tracking-widest">
            Live Attendance Registry
          </h3>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-mono text-sm">
              No students have signed in yet
            </p>
            <p className="text-zinc-600 font-mono text-xs mt-2">
              Waiting for authentication requests...
            </p>
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
                    Matric No
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Full Name
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {attendanceRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-bold text-orange-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-zinc-300">
                          {record.profiles?.matric_no || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium">
                          {record.profiles?.full_name || "Unknown Student"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-zinc-500" />
                          <span className="font-mono text-xs text-zinc-400">
                            {formatTime(record.signed_at)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="font-mono text-xs text-emerald-500">
                            {formatDistance(record.distance_meters)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
