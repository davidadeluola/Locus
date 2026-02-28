import React from 'react';
import { MapPin } from 'lucide-react';

export default function LocationStatus({ location, locationError, gettingLocation, onRetry }) {
  return (
    <div className="mb-6 p-4 bg-black/40 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin
            className={
              location
                ? 'text-emerald-500'
                : locationError
                ? 'text-red-500'
                : 'text-orange-500'
            }
            size={20}
          />
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase">Geolocation</p>
            <p className="text-sm font-mono">
              {gettingLocation ? (
                <span className="text-zinc-400">Acquiring coordinates...</span>
              ) : location ? (
                <span className="text-emerald-500">Position Locked</span>
              ) : locationError ? (
                <span className="text-red-500">Access Denied</span>
              ) : (
                <span className="text-zinc-400">Standby</span>
              )}
            </p>
          </div>
        </div>
        {!location && !gettingLocation && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs uppercase font-mono hover:bg-orange-500/20 transition-all"
          >
            Retry
          </button>
        )}
      </div>
      {locationError && <p className="mt-3 text-xs text-red-400 font-mono">{locationError}</p>}
    </div>
  );
}
