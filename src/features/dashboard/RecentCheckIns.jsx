import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import usePagination from '../../hooks/ui/usePagination';

const PAGE_SIZE = 5;

function formatCheckInTime(value) {
  if (!value) return 'Unknown time';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown time';
  return parsed.toLocaleString();
}

/**
 * @param {{
 *  attendance: Array<any>,
 *  loading?: boolean
 * }} props
 */
export default function RecentCheckIns({ attendance = [], loading = false }) {
  const sortedCheckIns = useMemo(() => {
    return [...attendance].sort((first, second) => {
      const firstTime = new Date(first?.signed_at || first?.created_at || 0).getTime();
      const secondTime = new Date(second?.signed_at || second?.created_at || 0).getTime();
      return secondTime - firstTime;
    });
  }, [attendance]);

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePagination(sortedCheckIns, PAGE_SIZE);

  return (
    <section className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <History size={14} className="text-orange-500" />
          <span>Recent Check-In History</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400">Total: {totalItems}</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading check-ins...</p>
      ) : paginatedItems.length === 0 ? (
        <p className="text-sm text-zinc-500">No check-ins yet.</p>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((log, index) => {
            const timeLabel = formatCheckInTime(log?.signed_at || log?.created_at);
            const classInfo = log?.sessions?.classes;
            const courseCode = classInfo?.course_code || 'N/A';
            const courseTitle = classInfo?.course_title || 'Unknown course';

            return (
              <article
                key={log?.id || `${log?.session_id || 'session'}-${index}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-white">{courseCode}</p>
                  <p className="text-xs sm:text-sm font-mono text-zinc-400">{timeLabel}</p>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-zinc-300">{courseTitle}</p>
                <p className="mt-2 text-xs text-zinc-500">Session ID: {log?.session_id || 'N/A'}</p>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">Page {currentPage} of {totalPages} · {PAGE_SIZE} per page</p>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="px-3 py-2 rounded-lg text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="px-3 py-2 rounded-lg text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
