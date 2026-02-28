import React from "react";
import useAttendanceData from "./hooks/useAttendanceData";
import { useAuthContext } from '../../context/AuthContext';
import SessionInfoCard from "./components/SessionInfoCard";
import EnrollmentList from "./components/EnrollmentList";
import AttendanceTable from "./components/AttendanceTable";
import { formatDistance } from "../../lib/utils/attendanceUtils";

const AttendanceList = ({ sessionId }) => {
  const { activeSession } = useAuthContext();
  const effectiveSessionId = sessionId || activeSession?.id || null;
  const { loading, attendanceRecords, sessionInfo, enrolledStudents, stats, exportSessionCsv } = useAttendanceData(effectiveSessionId);
  const { profile, user } = useAuthContext();
  const lecturerName = profile?.full_name || user?.email || '';

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 font-mono text-sm">Loading attendance data...</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SessionInfoCard sessionInfo={sessionInfo} enrolledCount={enrolledStudents.length} onExport={exportSessionCsv} lecturerName={lecturerName} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono text-zinc-500">Students signed in</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-zinc-500">Distance avg</p>
              <p className="text-3xl font-bold">{formatDistance(stats.avgDistance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-500">Enrolled Students</h4>
            <span className="text-xs font-mono text-zinc-600">{enrolledStudents.length} enrolled</span>
          </div>
          <EnrollmentList enrolledStudents={enrolledStudents} />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-mono text-sm uppercase tracking-widest">Live Attendance Registry</h3>
        </div>
        <AttendanceTable attendanceRecords={attendanceRecords} formatTime={formatTime} formatDistance={formatDistance} />
      </div>
    </div>
  );
};

export default AttendanceList;
