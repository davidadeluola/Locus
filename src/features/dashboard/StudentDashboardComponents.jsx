import React from 'react';

export function StudentStatsGrid({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-zinc-900 rounded-lg">Enrolled<br/><strong>{stats?.enrolledCourses ?? stats?.totalCourses ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Courses<br/><strong>{stats?.totalCourses ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Sessions<br/><strong>{stats?.totalSessions ?? '-'}</strong></div>
      <div className="p-4 bg-zinc-900 rounded-lg">Rate<br/><strong>{stats?.attendanceRate ?? '-'}%</strong></div>
    </div>
  );
}

export function AttendanceTrendChart({ data = [], loading }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <h4 className="text-sm text-zinc-400 mb-2">Attendance Trend</h4>
      <div className="h-36 flex items-center justify-center text-zinc-500">{loading ? 'Loading...' : data.length ? 'Chart' : 'No data'}</div>
    </div>
  );
}

export function EnrolledCoursesList({ courses = [], loading }) {
  if (loading) return <div className="text-sm text-zinc-500">Loading courses...</div>;
  if (!courses || courses.length === 0) return <div className="text-sm text-zinc-500">No courses</div>;

  return (
    <ul className="space-y-2">
      {courses.map((c) => (
        <li key={c.id} className="p-2 bg-zinc-800 rounded-md">{c.course_code} — {c.course_title}</li>
      ))}
    </ul>
  );
}

export function AttendanceStatusCard({ attendanceRate = 0, targetRate = 95 }) {
  const delta = targetRate - (attendanceRate || 0);
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h4 className="text-sm text-zinc-400 mb-2">Attendance Status</h4>
      <div className="text-3xl font-bold text-white">{attendanceRate}%</div>
      <div className="text-xs text-zinc-500">Target: {targetRate}% — {delta > 0 ? `${delta}% below` : 'On target'}</div>
    </div>
  );
}

export default {
  StudentStatsGrid,
  AttendanceTrendChart,
  EnrolledCoursesList,
  AttendanceStatusCard,
};
