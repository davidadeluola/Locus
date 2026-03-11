import { ShieldCheck } from 'lucide-react';
import usePagination from '../../../hooks/ui/usePagination';
import { formatDistance } from '../../../lib/utils/attendanceUtils';
import PaginationControls from './PaginationControls';

const PAGE_SIZE = 10;

function formatDateTime(value) {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
}

export default function AuditRecordsTable({ records, loading, title }) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePagination(records, PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-6 font-mono text-sm uppercase tracking-widest">{title}</h3>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading attendance records...</p>
      ) : records.length === 0 ? (
        <div className="py-12 text-center">
          <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={48} />
          <p className="text-sm font-mono text-zinc-500">No audit logs available for the selected filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-215">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">No.</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Date</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Student</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Matric</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Course</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Distance</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((log, index) => (
                <tr key={log.id} className="border-b border-zinc-800/50 transition-all hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{formatDateTime(log.signed_at)}</td>
                  <td className="px-4 py-3 text-sm">{log.profiles?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{log.profiles?.matric_no || 'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.sessions?.classes?.course_code || 'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-500">{formatDistance(log.distance_meters)}</td>
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