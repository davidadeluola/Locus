/**
 * @fileoverview Lecturer Dashboard Stats Card Component
 * Displays quick statistics
 */

import React from 'react';
import { Users, BookOpen, Zap, TrendingUp } from 'lucide-react';

/**
 * @param {{
 *   totalStudents: number,
 *   totalCourses: number,
 *   totalSessions: number,
 *   overallRate: number
 * }} stats - Dashboard statistics
 */
export function LecturerStatsGrid({ stats = {} }) {
  const s = stats || {};
  const {
    totalStudents = 0,
    totalCourses = 0,
    totalSessions = 0,
    overallRate = 0,
  } = s;

  const statCards = [
    { icon: Users, label: 'Total Students', value: totalStudents, color: 'text-blue-500' },
    { icon: BookOpen, label: 'Total Courses', value: totalCourses, color: 'text-orange-500' },
    { icon: Zap, label: 'Sessions Created', value: totalSessions, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Avg Attendance', value: `${overallRate}%`, color: 'text-emerald-500' },
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
                {card.label.split(' ')[0]}
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
 * @fileoverview Recent Sessions List Component
 */

/**
 * @param {{
 *   sessions: import('../types').Session[],
 *   onSessionSelect: (sessionId: string) => void,
 *   loading: boolean
 * }} props - Component props
 */
export function RecentSessionsList({ sessions = [], onSessionSelect = () => {}, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-800 h-12 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 text-sm">No sessions yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSessionSelect(session.id)}
          className="w-full text-left p-4 bg-zinc-800/50 border border-zinc-700 hover:border-orange-500/50 rounded-lg transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm text-white">
                {session.classes?.course_code}: {session.classes?.course_title}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(session.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-500">
                {session.attendance_count || 0}
              </p>
              <p className="text-xs text-zinc-500">Present</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * @fileoverview Session Performance Card Component
 */

/**
 * @param {{
 *   performance: import('../types').SessionPerformance | null,
 *   loading: boolean
 * }} props - Component props
 */
export function SessionPerformanceCard({ performance = null, loading = false }) {
  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl animate-pulse">
        <div className="h-6 bg-zinc-700 rounded w-32 mb-4" />
        <div className="h-16 bg-zinc-700 rounded mb-4" />
        <div className="h-4 bg-zinc-700 rounded w-24" />
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center">
        <p className="text-zinc-500 text-sm">No active session data</p>
      </div>
    );
  }

  const progressColor = performance.attendanceDensity >= 75
    ? 'bg-emerald-500'
    : performance.attendanceDensity >= 50
    ? 'bg-yellow-500'
    : 'bg-red-500';

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 p-6 rounded-2xl">
      <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="text-orange-500">📊</span>
        Latest Session Performance
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-white mb-2">
            {performance.studentsPresent}/{performance.expectedStudents}
          </p>
          <p className="text-xs text-zinc-400">Students Present</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-xs font-semibold text-zinc-300">Attendance Density</span>
            <span className="text-lg font-bold text-orange-500">{performance.attendanceDensity}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all`}
              style={{ width: `${Math.min(100, performance.attendanceDensity)}%` }}
            />
          </div>
        </div>

        {performance.course_code && (
          <p className="text-xs text-zinc-500 mt-4">Course: {performance.course_code}</p>
        )}
      </div>
    </div>
  );
}
