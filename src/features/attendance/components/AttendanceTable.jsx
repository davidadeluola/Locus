import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users } from 'lucide-react';

const AttendanceTable = ({ attendanceRecords, formatTime, formatDistance }) => {
  if (!attendanceRecords || attendanceRecords.length === 0) return (
    <div className="text-center py-12">
      <Users className="mx-auto mb-4 text-zinc-700" size={48} />
      <p className="text-zinc-500 font-mono text-sm">No students have signed in yet</p>
      <p className="text-zinc-600 font-mono text-xs mt-2">Waiting for authentication requests...</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">S/N</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Matric No</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Full Name</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Time</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Distance</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {attendanceRecords.map((record, index) => (
              <tr key={record.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all">
                <td className="py-4 px-4"><span className="font-mono text-sm font-bold text-orange-500">{String(index + 1).padStart(2, '0')}</span></td>
                <td className="py-4 px-4"><span className="font-mono text-sm text-zinc-300">{record.profiles?.matric_no || 'N/A'}</span></td>
                <td className="py-4 px-4"><span className="text-sm font-medium">{record.profiles?.full_name || 'Unknown Student'}</span></td>
                <td className="py-4 px-4"><div className="flex items-center gap-2"><Clock size={14} className="text-zinc-500" /><span className="font-mono text-xs text-zinc-400">{formatTime(record.signed_at)}</span></div></td>
                <td className="py-4 px-4"><div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /><span className="font-mono text-xs text-emerald-500">{formatDistance(record.distance_meters)}</span></div></td>
              </tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
