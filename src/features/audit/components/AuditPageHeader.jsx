import { Calendar, Files, ShieldCheck } from 'lucide-react';

export default function AuditPageHeader({ sessionCount, recordCount, fileCount }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ShieldCheck className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Attendance Audit</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">Review persisted attendance records, summary files, and class activity.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Sessions</p>
          <div className="mt-3 flex items-center gap-2 text-white">
            <Calendar size={16} className="text-orange-500" />
            <span className="text-xl font-semibold">{sessionCount}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Attendance Records</p>
          <div className="mt-3 flex items-center gap-2 text-white">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-xl font-semibold">{recordCount}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Saved Summary Files</p>
          <div className="mt-3 flex items-center gap-2 text-white">
            <Files size={16} className="text-sky-500" />
            <span className="text-xl font-semibold">{fileCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}