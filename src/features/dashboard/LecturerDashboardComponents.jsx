import React from 'react';

export function LecturerStatsGrid({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-zinc-900 rounded-lg">Students<br/><strong>{stats?.totalStudents ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Courses<br/><strong>{stats?.totalCourses ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Sessions<br/><strong>{stats?.totalSessions ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Rate<br/><strong>{stats?.overallRate ?? '-'}%</strong></div>
    </div>
  );
}

export function RecentSessionsList({ sessions = [], loading }) {
  if (loading) return <div className="text-sm text-zinc-500">Loading sessions...</div>;
  if (!sessions || sessions.length === 0) return <div className="text-sm text-zinc-500">No recent sessions</div>;

  return (
    <ul className="space-y-2">
      {sessions.map(s => (
        <li key={s.id} className="p-2 bg-zinc-800 rounded-md">{s.classes?.course_code || '—'} — Attended: {s.attendance_count ?? 0}</li>
      ))}
    </ul>
  );
}

export function SessionPerformanceCard({ performance, loading }) {
  if (loading) return <div className="text-sm text-zinc-500">Loading performance...</div>;
  if (!performance) return <div className="text-sm text-zinc-500">No active session</div>;

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h4 className="text-sm text-zinc-400 mb-1">Active Session Performance</h4>
      <div className="text-2xl font-bold text-white">{performance.attendanceDensity ?? 0}%</div>
      <div className="text-xs text-zinc-500">Present: {performance.studentsPresent ?? 0} / {performance.expectedStudents ?? '-'}</div>
    </div>
  );
}

export default { LecturerStatsGrid, RecentSessionsList, SessionPerformanceCard };
