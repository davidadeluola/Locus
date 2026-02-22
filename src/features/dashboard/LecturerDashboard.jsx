import React, { useState, useEffect } from "react";
import { Users, Clock, TrendingUp, CheckCircle2, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "../../api/supabase";
import SessionCreator from "../sessions/SessionCreator";
import AttendanceList from "../attendance/AttendanceList";
import { generateOTP } from "../../lib/utils/attendanceUtils";

const DEFAULT_EXPECTED_STUDENTS = 50;

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user, activeSession, setActiveSession } = useUser();
  const [activeClass, setActiveClass] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalSessions: 0,
    overallRate: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionPerformance, setSessionPerformance] = useState(null);
  const [attendanceTrendData, setAttendanceTrendData] = useState([]);
  const [courseComparisonData, setCourseComparisonData] = useState([]);

  const calculateSessionPerformance = async (
    activeSessionId,
    expectedStudents = DEFAULT_EXPECTED_STUDENTS
  ) => {
    if (!activeSessionId) {
      return null;
    }

    const { count, error } = await supabase
      .from("attendance_logs")
      .select("id", { count: "exact", head: true })
      .eq("session_id", activeSessionId);

    if (error) {
      throw error;
    }

    const studentsPresent = count || 0;
    const attendanceDensity =
      expectedStudents > 0
        ? Math.round((studentsPresent / expectedStudents) * 100)
        : 0;

    return {
      studentsPresent,
      expectedStudents,
      attendanceDensity,
    };
  };

  // Fetch lecturer statistics and attendance data
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get total courses taught
        const { data: courses } = await supabase
          .from("classes")
          .select("id, course_code")
          .eq("lecturer_id", user.id);
        
        const courseIds = courses?.map((c) => c.id) || [];
        const courseCount = courseIds.length;

        // Get total students enrolled in lecturer's courses
        let enrollments = [];
        if (courseIds.length > 0) {
          const { data } = await supabase
            .from("class_enrollments")
            .select("user_id")
            .in("class_id", courseIds);

          enrollments = data || [];
        }
        
        const uniqueStudents = new Set(enrollments.map((e) => e.user_id) || []).size;

        // Get total sessions
        const { count: sessionCount } = await supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("lecturer_id", user.id);

        // Get attendance rate
        const { count: attendanceLogCount } = await supabase
          .from("attendance_logs")
          .select("id, sessions!inner(lecturer_id)", { count: "exact", head: true })
          .eq("sessions.lecturer_id", user.id);
        
        const attendanceRate = sessionCount > 0 
          ? Math.round(((attendanceLogCount || 0) / (sessionCount * (uniqueStudents || 1))) * 100)
          : 0;

        setStats({
          totalStudents: uniqueStudents,
          totalCourses: courseCount,
          totalSessions: sessionCount || 0,
          overallRate: attendanceRate,
        });

        // Fetch recent sessions
        const { data: recentSessionsData, error: recentSessionsError } = await supabase
          .from("sessions")
          .select("id, active_session_id, class_id, created_at, expires_at, classes!inner(course_code, course_title)")
          .eq("lecturer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentSessionsError) throw recentSessionsError;

        if (recentSessionsData?.length) {
          const sessionPromises = recentSessionsData.map(async (session) => {
            const { count } = await supabase
              .from("attendance_logs")
              .select("id", { count: "exact", head: true })
              .eq("session_id", session.id);
            
            return {
              ...session,
              attendance_count: count || 0,
            };
          });

          const sessionsWithAttendance = await Promise.all(sessionPromises);
          setRecentSessions(sessionsWithAttendance);

          const latestSession = sessionsWithAttendance[0];
          const latestSessionRef = latestSession?.active_session_id || latestSession?.id;
          const performance = await calculateSessionPerformance(latestSessionRef);

          setSessionPerformance(
            performance
              ? {
                  ...performance,
                  course_code: latestSession?.classes?.course_code || "N/A",
                }
              : null
          );
        } else {
          setRecentSessions([]);
          setSessionPerformance(null);
        }

        // Generate attendance trend data (mock weekly data based on sessions)
        const trendData = [];
        for (let i = 4; i >= 0; i--) {
          const weekDate = new Date();
          weekDate.setDate(weekDate.getDate() - i * 7);
          trendData.push({
            week: `Week ${5 - i}`,
            rate: Math.max(70, 95 - Math.random() * 25),
          });
        }
        setAttendanceTrendData(trendData);

        // Generate course comparison data
        if (courses && courses.length > 0) {
          const courseCompData = [];
          for (const course of courses.slice(0, 5)) {
            const { data: classData } = await supabase
              .from("classes")
              .select("course_code")
              .eq("id", course.id)
              .single();

            courseCompData.push({
              course: classData?.course_code || "Course",
              avgRate: Math.max(70, 95 - Math.random() * 25),
            });
          }
          setCourseComparisonData(courseCompData);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (!activeSession?.class_id) {
      setActiveClass(null);
      return;
    }

    const fetchActiveClass = async () => {
      const { data } = await supabase
        .from("classes")
        .select("id, course_code, course_title")
        .eq("id", activeSession.class_id)
        .maybeSingle();

      setActiveClass(data || null);
    };

    fetchActiveClass();
  }, [activeSession?.class_id]);

  const exportSessionAudit = async (sessionId) => {
    const { data: logs } = await supabase
      .from("attendance_logs")
      .select(
        `
          id,
          signed_at,
          distance_meters,
          profiles:student_id(full_name, matric_no)
        `
      )
      .eq("session_id", sessionId)
      .order("signed_at", { ascending: true });

    const headers = ["session_id", "course_code", "course_title", "full_name", "matric_no", "signed_at", "distance_meters"];
    const rows = (logs || []).map((item) => [
      sessionId,
      activeClass?.course_code || "N/A",
      activeClass?.course_title || "N/A",
      item.profiles?.full_name || "",
      item.profiles?.matric_no || "",
      item.signed_at || "",
      item.distance_meters ?? "",
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

  const handleRegenerateSession = async () => {
    if (!activeSession?.id) return;
    const nextExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("sessions")
      .update({ otp_secret: generateOTP(), expires_at: nextExpiry })
      .eq("id", activeSession.id)
      .select("id, class_id, lecturer_id, otp_secret, latitude, longitude, expires_at, created_at")
      .single();

    if (data) setActiveSession(data);
  };

  const handleTerminateSession = async () => {
    if (!activeSession?.id) return;
    await exportSessionAudit(activeSession.id);
    await supabase
      .from("sessions")
      .update({ expires_at: new Date().toISOString() })
      .eq("id", activeSession.id);

    const endedSessionId = activeSession.id;
    setActiveSession(null);
    navigate(`/dashboard/audit?sessionId=${endedSessionId}`);
  };

  return (
    <div className="space-y-8">
      {/* Session Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SessionCreator />
        </div>
        
        <div className="lg:col-span-2">
          {activeSession && <AttendanceList sessionId={activeSession.id} />}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-orange-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs text-zinc-500 mt-1">Students enrolled</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-blue-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Active</span>
          </div>
          <p className="text-3xl font-bold">{String(stats.totalCourses).padStart(2, "0")}</p>
          <p className="text-xs text-zinc-500 mt-1">Courses this term</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-emerald-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats.overallRate}%</p>
          <p className="text-xs text-zinc-500 mt-1">Avg attendance</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="text-purple-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Sessions</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
          <p className="text-xs text-zinc-500 mt-1">Total this term</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Session Card */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
          {activeSession ? (
            <>
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono uppercase text-emerald-500">Live</span>
                </div>
              </div>
              <h3 className="font-mono text-xs text-zinc-500 uppercase mb-6">
                Active Session: {activeClass?.course_code || "N/A"} - {activeClass?.course_title || "Current Class"}
              </h3>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-5xl font-mono font-bold tracking-widest text-orange-500">
                    {activeSession.otp_secret}
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase mt-2 font-mono">
                    Current Access Cipher
                  </p>
                </div>
                <div className="h-20 w-px bg-zinc-800"></div>
                <div>
                  <p className="text-lg font-bold font-mono text-zinc-300">
                    Ends {new Date(activeSession.expires_at).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase mt-2 font-mono">
                    Session Timeout
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 flex gap-3">
                <button
                  onClick={handleTerminateSession}
                  className="flex-1 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs uppercase font-mono hover:bg-red-500/20 transition-all"
                >
                  Terminate Session
                </button>
                <button
                  onClick={handleRegenerateSession}
                  className="flex-1 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs uppercase font-mono hover:bg-orange-500/20 transition-all"
                >
                  Regenerate Code
                </button>
              </div>
            </>
          ) : (
            <div className="h-full min-h-52 flex items-center justify-center text-zinc-500 font-mono text-sm">
              No active class session. Create one from Lecturer Control.
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <BarChart className="text-orange-500" size={24} />
            <h4 className="text-sm uppercase font-mono tracking-wider">
              Quick Actions
            </h4>
          </div>
          <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs uppercase font-mono transition-all text-left px-4">
            📊 Export Attendance CSV
          </button>
          <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs uppercase font-mono transition-all text-left px-4">
            📧 Email Absent Students
          </button>
          <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs uppercase font-mono transition-all text-left px-4">
            📈 View Analytics Dashboard
          </button>
        </div>
      </div>

      {/* Recent History */}
      <section className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="font-mono text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock size={18} className="text-orange-500" />
          Recent History
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-orange-500" />
              <p className="text-xs uppercase tracking-wider font-mono text-zinc-400">
                Session Performance
              </p>
            </div>

            {sessionPerformance ? (
              <div className="space-y-4">
                <p className="text-xl font-bold font-mono text-zinc-100">
                  {sessionPerformance.course_code}
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="inline-flex items-center gap-2">
                      <Users size={12} />
                      Students Present
                    </span>
                    <span className="text-zinc-200">{sessionPerformance.studentsPresent}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Expected Students</span>
                    <span className="text-zinc-200">{sessionPerformance.expectedStudents}</span>
                  </div>
                  <div className="h-px bg-zinc-800" />
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Attendance Density</span>
                    <span className="text-emerald-500 font-bold">
                      {sessionPerformance.attendanceDensity}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-4 font-mono">
                No recent session metrics yet.
              </p>
            )}
          </div>

          <div className="xl:col-span-2 bg-black/40 border border-zinc-800 rounded-xl p-2 overflow-x-auto">
            {recentSessions.length > 0 ? (
              <table className="w-full min-w-190 text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                    <th className="text-left py-3 px-3">Course Code</th>
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-left py-3 px-3">Start Time</th>
                    <th className="text-left py-3 px-3">Status</th>
                    <th className="text-left py-3 px-3">Attendance Count</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => {
                    const isDepleted = new Date(session.expires_at) < new Date();
                    return (
                      <tr
                        key={session.id}
                        className="border-b border-zinc-900 last:border-b-0 text-zinc-300"
                      >
                        <td className="py-3 px-3 text-zinc-100">
                          <Link to={`/dashboard/audit?sessionId=${session.id}`} className="hover:text-orange-500 transition-all">
                            {session.classes?.course_code || "N/A"}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          {new Date(session.created_at).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3">
                          {new Date(session.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3">
                          {isDepleted ? (
                            <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-500 uppercase">
                              Depleted
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] text-green-500 uppercase animate-pulse">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-100">{session.attendance_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-zinc-500 py-4 px-3 font-mono">
                No sessions yet. Create one to get started.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-orange-500" size={20} />
            <h4 className="text-sm uppercase font-mono tracking-wider">Attendance Trend</h4>
          </div>
          {attendanceTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="week" 
                  stroke="#71717a" 
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-zinc-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Course Comparison Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-blue-500" size={20} />
            <h4 className="text-sm uppercase font-mono tracking-wider">Course Comparison</h4>
          </div>
          {courseComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={courseComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="course" 
                  stroke="#71717a" 
                  style={{ fontSize: '10px', fontFamily: 'monospace' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="avgRate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-zinc-500">
              No comparison data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
