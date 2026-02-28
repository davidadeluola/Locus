import React from 'react';
import { Clock, CheckCircle, MapPin } from 'lucide-react';

export default function ActiveSession({ session, timeRemaining, endSession, extendSession, regenerateSession, formatTime }) {
  if (!session) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono uppercase text-emerald-500">Live Session</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <CheckCircle className="text-emerald-500" size={24} />
        </div>
        <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-500">Session Active</h3>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={regenerateSession}
          className="flex-1 py-3 bg-zinc-700/20 text-zinc-300 border border-zinc-700/30 rounded-xl text-sm uppercase font-mono hover:bg-zinc-700/30 transition-all"
        >
          Regenerate Session
        </button>

        <button
          onClick={endSession}
          className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm uppercase font-mono hover:bg-red-500/20 transition-all"
        >
          Terminate Session
        </button>
      </div>

      <div className="mb-6 p-6 bg-black/40 rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={24} />
            <span className="text-xs font-mono text-zinc-500 uppercase">Time Remaining</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="mb-6 p-8 bg-black/60 rounded-xl border border-orange-500/30">
        <p className="text-xs font-mono text-zinc-500 uppercase mb-3 text-center">Access Code</p>
        <p className="text-6xl font-mono font-bold tracking-widest text-orange-500 text-center">{session.otp_secret}</p>
      </div>

      <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <MapPin size={16} className="text-orange-500" />
          <span>{Number(session.latitude).toFixed(6)}, {Number(session.longitude).toFixed(6)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => extendSession?.(5)}
          className="flex-1 py-3 bg-amber-700/10 text-amber-400 border border-amber-700/20 rounded-xl text-sm uppercase font-mono hover:bg-amber-700/20 transition-all"
        >
          +5 Minutes
        </button>
      </div>
    </div>
  );
}
