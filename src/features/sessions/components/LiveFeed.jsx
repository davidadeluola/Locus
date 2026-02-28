import React from 'react';

export default function LiveFeed({ students = [] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-sm">
      <div className="text-xs text-zinc-400 uppercase mb-2">Live Feed</div>
      <div className="space-y-2 max-h-56 overflow-auto">
        {students.length === 0 && (
          <div className="text-zinc-500">No students yet</div>
        )}
        {students.map((s) => (
          <div key={s.id} className="flex justify-between text-white">
            <div className="truncate">{s.name}</div>
            <div className="text-zinc-400 ml-4">{s.matric || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
