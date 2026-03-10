import { Calendar, Download, ShieldCheck, Users } from 'lucide-react';
import usePagination from '../../../hooks/ui/usePagination';
import PaginationControls from './PaginationControls';

const PAGE_SIZE = 10;

export default function AuditSummaryTable({ sessions, loading, onExportSessionReport }) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePagination(sessions, PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/10 p-2">
          <Calendar className="text-orange-500" size={20} />
        </div>
        <h3 className="font-mono text-sm uppercase tracking-widest">Session Summary</h3>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading session summaries...</p>
      ) : sessions.length === 0 ? (
        <div className="py-12 text-center">
          <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={48} />
          <p className="text-sm font-mono text-zinc-500">No sessions found for the selected filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">S/N</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Course Title</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Course Code</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Students Registered</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Date & Time</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Download</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((session, index) => (
                <tr key={session.session_id} className="border-b border-zinc-800/50 transition-all hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">{session.course_title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{session.course_code}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1 font-mono text-xs text-orange-500">
                      <Users size={12} />
                      {session.total}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{new Date(session.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onExportSessionReport(session.session_id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-mono uppercase text-emerald-500 transition-all hover:bg-emerald-500/20"
                    >
                      <Download size={12} />
                      CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </div>
      )}
    </section>
  );
}