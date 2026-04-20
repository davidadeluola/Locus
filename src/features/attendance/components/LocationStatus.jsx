import React from 'react';
import { MapPin } from 'lucide-react';

function formatPermissionLabel(permissionState, permissionsSupported) {
  if (!permissionsSupported) return 'Permission API not supported';
  if (permissionState === 'granted') return 'Permission granted';
  if (permissionState === 'denied') return 'Permission denied';
  if (permissionState === 'prompt') return 'Permission prompt required';
  return 'Permission status unavailable';
}

export default function LocationStatus({
  location,
  locationError,
  gettingLocation,
  onRetry,
  permissionState,
  permissionsSupported,
  isSecure,
}) {
  const permissionText = formatPermissionLabel(permissionState, permissionsSupported);

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
      <div className="mt-3 space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">
          {permissionText}
        </p>
        {!isSecure ? (
          <p className="text-[11px] text-amber-400 font-mono">
            Insecure context detected. Geolocation requires HTTPS or localhost in most browsers.
          </p>
        ) : null}
      </div>
      {locationError && <p className="mt-3 text-xs text-red-400 font-mono">{locationError}</p>}
    </div>
  );
}
