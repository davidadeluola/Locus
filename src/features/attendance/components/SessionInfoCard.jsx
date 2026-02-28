import React from 'react';
import { BookOpen, Download } from 'lucide-react';

const SessionInfoCard = ({ sessionInfo, enrolledCount, onExport, lecturerName }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            <h3 className="font-mono text-sm uppercase tracking-widest text-zinc-300">Session Class Context</h3>
          </div>
          <p className="text-xs font-mono text-zinc-500">Course: <span className="text-zinc-300">{sessionInfo?.classes?.course_code || 'N/A'}</span> — {sessionInfo?.classes?.course_title || 'Untitled Course'}</p>
          <p className="text-xs font-mono text-zinc-500">Lecturer: <span className="text-zinc-300">{lecturerName || 'N/A'}</span></p>
          <p className="text-xs font-mono text-zinc-500">Session Window: {sessionInfo?.created_at || ''} → {sessionInfo?.expires_at || ''}</p>
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={!enrolledCount}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs uppercase font-mono hover:bg-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export Session CSV
        </button>
      </div>
    </div>
  );
};

export default SessionInfoCard;
