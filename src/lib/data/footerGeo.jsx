import { useGeolocation } from "../../hooks/useGeolocation";

const GeoStatusVisual = () => {
  const { latitude, longitude, loading, error } = useGeolocation();

  return (
    <div className="relative w-64 h-64">
      {/* Outer Rings */}
      <div className="absolute inset-0 border border-zinc-800 rounded-full animate-[ping_4s_linear_infinite]" />
      <div className="absolute inset-4 border border-zinc-800 rounded-full animate-[ping_3s_linear_infinite]" />

      {/* Radar Scanner */}
      <div className="absolute inset-0 rounded-full border border-orange-600/20 bg-gradient-to-tr from-transparent via-transparent to-orange-600/10 animate-[spin_5s_linear_infinite]" />

      {/* Crosshair */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-zinc-800 -translate-x-1/2" />

      {/* Target Marker */}
      <div className="absolute top-1/3 right-1/4 group cursor-help">
        <div className="h-3 w-3 bg-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,1)] animate-pulse" />
        <div className="absolute left-5 -top-2 bg-zinc-950 border border-zinc-800 p-2 rounded text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          Your Location
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center font-mono">
          <span className="block text-[8px] text-zinc-600">LOCATING_NODE</span>
          <span className="block text-[10px] text-zinc-500 mb-1">
            {loading
              ? "ACQUIRING_SIGNAL"
              : error
              ? "SIGNAL_UNAVAILABLE"
              : "SIGNAL_LOCKED"}
          </span>
          <span className="block text-xs text-orange-600 font-bold">
            {loading ? "LAT: ---" : error ? "LAT: N/A" : `LAT: ${latitude}° N`}
          </span>
          <span className="block text-xs text-orange-600 font-bold">
            {loading
              ? "LNG: ---"
              : error
              ? "LNG: N/A"
              : `LNG: ${longitude}° E`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeoStatusVisual;
