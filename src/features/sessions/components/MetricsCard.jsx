import React from 'react';

export default function MetricsCard({ percentage }) {
  const display = typeof percentage === 'number' ? `${percentage}%` : '0%';
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
      <div>
        <div className="text-xs font-mono text-zinc-400 uppercase">Room Filled</div>
        <div className="text-2xl font-bold text-orange-500">{display}</div>
      </div>
      <div className="w-24 h-6 bg-zinc-800 rounded overflow-hidden">
        <div style={{ width: display }} className="h-full bg-orange-500" />
      </div>
    </div>
  );
}
