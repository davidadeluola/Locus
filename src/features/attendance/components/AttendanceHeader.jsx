import React from 'react';
import { QrCode } from 'lucide-react';

export default function AttendanceHeader({ title = 'Attendance Clearance Portal' }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-orange-500/10 rounded-lg">
        <QrCode className="text-orange-500" size={24} />
      </div>
      <h3 className="font-mono text-sm uppercase tracking-widest">{title}</h3>
    </div>
  );
}
