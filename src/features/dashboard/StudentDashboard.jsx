import React, { useMemo } from "react";
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Target,
  History,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import AttendanceVerification from "../attendance/AttendanceVerification";
import { useStudentAttendance } from "../../hooks/useDashboardData";

const StudentDashboard = () => {
  const { attendance, stats } = useStudentAttendance();

  // Generate monthly attendance data from real attendance logs
  const chartData = useMemo(() => {
    if (attendance.length > 0) {
      // Group attendance by month
      const monthlyData = {};
      attendance.forEach((record) => {
        const date = new Date(record.signed_at);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      // Convert to chart format (last 6 months)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return months.map((month) => ({
        month,
        attendance: monthlyData[month] || 0,
      }));
    }
    return [];
  }, [attendance]);

  // Generate course performance data from attendance
  const coursePerformance = useMemo(() => {
    const courseMap = {};
    attendance.forEach((record) => {
      const courseCode = record.classes?.code || "Unknown";
      if (!courseMap[courseCode]) {
        courseMap[courseCode] = { course: courseCode, attended: 0, total: 0 };
      }
      courseMap[courseCode].attended += 1;
      courseMap[courseCode].total += 1;
    });

    return Object.values(courseMap).map((item) => ({
      course: item.course,
      percentage: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0,
    }));
  }, [attendance]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Attendance Portal */}
      <AttendanceVerification />

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <BookOpen className="text-orange-500" size={20} />
            <span className="text-[10px] font-mono text-zinc-600 uppercase hidden md:block">
              Courses
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats?.enrolledCourses || 0}</p>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1">
            Active courses
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <TrendingUp className="text-emerald-500" size={20} />
            <span className="text-[10px] font-mono text-zinc-600 uppercase hidden md:block">
              Rate
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats?.attendanceRate || 0}%</p>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1">
            Attendance
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <History className="text-blue-500" size={20} />
            <span className="text-[10px] font-mono text-zinc-600 uppercase hidden md:block">
              Sessions
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats?.totalSessions || 0}</p>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1">
            Total sessions
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <Target className="text-purple-500" size={20} />
            <span className="text-[10px] font-mono text-zinc-600 uppercase hidden md:block">
              Target
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">95%</p>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1">
            Goal achieved
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Attendance Trend */}
        <section className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl">
          <h3 className="font-mono text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" />
            Attendance Trend
          </h3>
          <AreaChart
            width={100}
            height={300}
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="colorAttendance"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="month"
              stroke="#71717a"
              style={{ fontSize: 12 }}
            />
            <YAxis stroke="#71717a" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#FF4D00"
              fillOpacity={1}
              fill="url(#colorAttendance)"
            />
          </AreaChart>
        </section>

        {/* Course Performance */}
        <section className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl">
          <h3 className="font-mono text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
            <Award size={18} className="text-orange-500" />
            Course Performance
          </h3>
          <div className="space-y-4">
            {coursePerformance.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-mono text-zinc-400">
                    {item.course}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-orange-500">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. Recent Activity */}
      <section className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h3 className="font-mono text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          Recent Check-ins
        </h3>
        <div className="space-y-3">
          {[
            { course: "CPE 403", time: "2 hours ago", status: "verified" },
            { course: "CPE 405", time: "1 day ago", status: "verified" },
            { course: "CPE 407", time: "2 days ago", status: "verified" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 md:p-4 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock
                    size={16}
                    className="text-orange-500 md:w-4.5 md:h-4.5"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs md:text-sm">{item.course}</p>
                <p className="text-[10px] md:text-xs text-zinc-500 font-mono">
                    {item.time}
                  </p>
                </div>
              </div>
              <span className="text-[10px] md:text-xs font-mono uppercase text-emerald-500 bg-emerald-500/10 px-2 md:px-3 py-1 rounded-lg">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
