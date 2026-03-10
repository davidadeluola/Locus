import { Download, Filter, RotateCcw } from 'lucide-react';

export default function AuditFiltersBar({
  classOptions,
  classFilter,
  sessionFilter,
  filteredSessionCount,
  savedFileCount,
  onClassFilterChange,
  onClearFilters,
  onExportAll,
  onExportSummary,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex flex-col gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-2">
              <Filter size={14} className="text-orange-500" />
              Class Filter
            </span>
            <select
              value={classFilter}
              onChange={(event) => onClassFilterChange(event.target.value)}
              className="min-w-55 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">All classes</option>
              {classOptions.map((klass) => (
                <option key={klass.id} value={klass.id}>
                  {klass.course_code} - {klass.course_title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
              {sessionFilter ? `Session ${sessionFilter.slice(0, 8)}...` : `${filteredSessionCount} sessions`}
            </span>
            <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">{savedFileCount} saved files</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onClearFilters}
            disabled={!classFilter && !sessionFilter}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-all hover:bg-zinc-800 disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Clear Filters
          </button>
          <button
            onClick={onExportAll}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-700"
          >
            <Download size={14} />
            Export Records
          </button>
          <button
            onClick={onExportSummary}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-600"
          >
            <Download size={14} />
            Export Summary
          </button>
        </div>
      </div>
    </div>
  );
}