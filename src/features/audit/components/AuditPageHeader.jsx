import { ShieldCheck } from 'lucide-react';

export default function AuditPageHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <ShieldCheck className="text-orange-500" size={24} />
        </div>
        <h1 className="text-2xl font-bold">Attendance Audit</h1>
      </div>
      <p className="text-zinc-500 font-mono text-sm">
        Review and verify attendance records
      </p>
    </div>
  );
}
