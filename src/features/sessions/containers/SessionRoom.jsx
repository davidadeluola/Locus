import React from 'react';
import RoomHeader from '../components/RoomHeader.jsx';
import MetricsCard from '../components/MetricsCard.jsx';
import LiveFeed from '../components/LiveFeed.jsx';
import useSessionRoom from '../../../hooks/useSessionRoom.js';

export default function SessionRoom({ sessionId }) {
  const { room, loading, error, refresh, regenerateOtp } = useSessionRoom(sessionId);

  return (
    <section className="space-y-4">
      {loading && <div className="text-sm font-mono text-zinc-400">Loading room...</div>}
      {error && <div className="text-sm font-mono text-red-500">{error}</div>}

      {room ? (
        <>
          <RoomHeader room={room} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <LiveFeed students={room.students || []} />
            </div>

            <div className="space-y-4">
              <MetricsCard percentage={room.metrics?.percentage_present ?? 0} />
              <div className="flex gap-2">
                <button
                  onClick={refresh}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-xs font-mono rounded-md"
                >
                  Refresh
                </button>
                <button
                  onClick={async () => { try { await regenerateOtp(); } catch (e) {} }}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono rounded-md"
                >
                  Regenerate OTP
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        !loading && <div className="text-sm font-mono text-zinc-500">No active room</div>
      )}
    </section>
  );
}
