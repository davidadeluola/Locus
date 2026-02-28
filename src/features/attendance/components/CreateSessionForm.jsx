import React from 'react';
import { MapPin, Loader2, XCircle } from 'lucide-react';

export default function CreateSessionForm({
  courses = [],
  courseLoading = false,
  selectedClassId,
  setSelectedClassId,
  durationMinutes,
  setDurationMinutes,
  MAX_SESSION_DURATION_MINUTES = 5,
  loading = false,
  createSession,
  error,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <MapPin className="text-orange-500" size={24} />
        </div>
        <h3 className="font-mono text-sm uppercase tracking-widest">Create Session</h3>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <XCircle className="text-red-500" size={20} />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-500 font-mono">ℹ️ Create a course first before creating a session</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
          <label className="text-xs font-mono text-zinc-500 uppercase mb-3 block">Select Course</label>
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={loading || courseLoading}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.course_title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
        <label className="text-xs font-mono text-zinc-500 uppercase mb-3 block">Session Duration (minutes)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max={MAX_SESSION_DURATION_MINUTES}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
            disabled={loading}
            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="text-center bg-black/40 px-4 py-2 rounded-lg min-w-20">
            <p className="text-2xl font-mono font-bold text-orange-500">{durationMinutes}</p>
            <p className="text-[10px] text-zinc-500 font-mono">min</p>
          </div>
        </div>
      </div>

      <button
        onClick={createSession}
        disabled={loading || courses.length === 0 || !selectedClassId}
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Acquiring Geolocation...
          </>
        ) : (
          <>
            <MapPin size={20} />
            Initiate Session
          </>
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center mt-4 font-mono">
        {courses.length === 0
          ? 'No courses available. Create a course first.'
          : `Session will be active for ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
