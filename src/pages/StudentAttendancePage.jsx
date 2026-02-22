import React from "react";
import { UserCheck, Clock, MapPin, TrendingUp } from "lucide-react";
import { useStudentAttendance } from "../hooks/useDashboardData";
import { formatDistance } from "../lib/utils/attendanceUtils";

const StudentAttendancePage = () => {
  const { attendance, loading, stats } = useStudentAttendance();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 font-mono text-sm">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <UserCheck className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">My Check-Ins</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">View your attendance history and statistics</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="text-orange-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
          <p className="text-xs text-zinc-500 mt-1">Classes attended</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-emerald-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats.attendanceRate}%</p>
          <p className="text-xs text-zinc-500 mt-1">Attendance rate</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-blue-500" size={24} />
            <span className="text-xs font-mono text-zinc-600 uppercase">Recent</span>
          </div>
          <p className="text-3xl font-bold">
            {attendance.length > 0 
              ? new Date(attendance[0].signed_at).toLocaleDateString()
              : "N/A"
            }
          </p>
          <p className="text-xs text-zinc-500 mt-1">Last check-in</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Clock size={20} className="text-orange-500" />
          Check-In History
        </h2>

        {attendance.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-mono text-sm">No check-ins recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-orange-500/30 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <UserCheck size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold">
                        {record.sessions?.classes?.course_code || "Unknown Course"}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">
                        {record.sessions?.classes?.course_title}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-zinc-400">
                    {new Date(record.signed_at).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-emerald-500 font-mono flex items-center justify-end gap-1 mt-1">
                    <MapPin size={12} />
                    {formatDistance(record.distance_meters)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendancePage;
