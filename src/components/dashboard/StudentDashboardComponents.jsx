/**
 * @fileoverview Student Dashboard Components
 * Separated UI components for better reusability and maintainability
 */

import React from 'react';
import { BookOpen, TrendingUp, History, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Student Stats Grid Component
 * @param {{
 *   enrolledCourses: number,
 *   attendanceRate: number,
 *   totalSessions: number
 * }} stats - Student statistics
 */
export function StudentStatsGrid({ stats = {} }) {
  const {
    enrolledCourses = 0,
    attendanceRate = 0,
    totalSessions = 0,
  } = stats;

  const statCards = [
    { icon: BookOpen, label: 'Courses', value: enrolledCourses, color: 'text-orange-500' },
    { icon: TrendingUp, label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'text-emerald-500' },
    { icon: History, label: 'Sessions Attended', value: totalSessions, color: 'text-blue-500' },
    { icon: Target, label: 'Target', value: '95%', color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Icon className={card.color} size={20} />
              <span className="text-[10px] font-mono text-zinc-600 uppercase hidden md:block">
                {card.label}
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
            <p className="text-[10px] md:text-xs text-zinc-500 mt-1">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Attendance Trend Chart Component
 * @param {{
 *   data: Array<{month: string, attendance: number}>,
 *   loading: boolean
 * }} props - Component props
 */
export function AttendanceTrendChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <div className="h-48 bg-zinc-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <section className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-2xl">
      <h3 className="font-mono text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
        <TrendingUp size={18} className="text-orange-500" />
        Attendance Trend (6 Months)
      </h3>

      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="month" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip
              contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#ea580c"
              fillOpacity={1}
              fill="url(#colorAttendance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-zinc-500">
          No attendance data available
        </div>
      )}
    </section>
  );
}

/**
 * Enrolled Courses List Component
 * @param {{
 *   courses: Array,
 *   loading: boolean
 * }} props - Component props
 */
export function EnrolledCoursesList({ courses = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-800 h-16 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 text-sm">No enrolled courses yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="p-4 bg-zinc-800/50 border border-zinc-700 hover:border-orange-500/50 rounded-lg transition-all"
        >
          <p className="font-semibold text-sm text-white">
            {course.course_code}: {course.course_title}
          </p>
          {course.description && (
            <p className="text-xs text-zinc-400 mt-1">{course.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Attendance Status Card Component
 * Shows overall attendance status and recommendations
 * @param {{
 *   attendanceRate: number,
 *   targetRate: number
 * }} props - Component props
 */
export function AttendanceStatusCard({ attendanceRate = 0, targetRate = 95 }) {
  const isOnTrack = attendanceRate >= targetRate;
  const difference = targetRate - attendanceRate;

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 p-6 rounded-2xl">
      <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="text-purple-500">🎯</span>
        Attendance Status
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs text-zinc-400">Current Rate</span>
            <span className={`text-lg font-bold ${isOnTrack ? 'text-emerald-500' : 'text-orange-500'}`}>
              {attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${isOnTrack ? 'bg-emerald-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-800/50 p-3 rounded-lg">
          {isOnTrack ? (
            <p className="text-xs text-emerald-300">
              ✅ Great! You're on track with your attendance goal of {targetRate}%
            </p>
          ) : (
            <p className="text-xs text-orange-300">
              ⚠️ You need {difference}% more attendance to reach your goal of {targetRate}%
            </p>
          )}
        </div>

        <hr className="border-zinc-700" />

        <div className="text-xs text-zinc-400 space-y-2">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500">
            <li>Mark attendance as early as possible</li>
            <li>All sessions require location verification</li>
            <li>Contact your lecturer if you have issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
