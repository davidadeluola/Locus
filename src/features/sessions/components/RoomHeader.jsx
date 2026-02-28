import React from 'react';

export default function RoomHeader({ room }) {
  const code = room?.class?.code || 'N/A';
  const title = room?.class?.title || 'Untitled';
  const lecturer = room?.lecturer?.name || 'Unknown Lecturer';

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-mono text-xs text-zinc-400 uppercase">{code}</div>
        <div className="font-bold text-sm text-white">{title}</div>
      </div>
      <div className="text-right text-xs font-mono text-zinc-400">
        <div className="text-[12px]">{lecturer}</div>
      </div>
    </div>
  );
}
