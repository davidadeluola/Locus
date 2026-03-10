import { Download, Files } from 'lucide-react';
import usePagination from '../../../hooks/ui/usePagination';
import PaginationControls from './PaginationControls';

const PAGE_SIZE = 10;

function getScopeLabel(file) {
  if (file.scope === 'all') return 'All Classes';
  if (file.scope === 'class') return file.metadata?.course_title || file.metadata?.course_code || 'Class Summary';
  return file.metadata?.course_title || 'Session Summary';
}

function getCourseLabel(file) {
  const code = file.metadata?.course_code || '';
  const title = file.metadata?.course_title || '';
  if (code && title) return `${code} - ${title}`;
  return code || title || 'N/A';
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
}

export default function SavedSummaryFilesTable({ files, loading, onDownloadFile }) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePagination(files, PAGE_SIZE);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-sky-500/10 p-2">
          <Files className="text-sky-500" size={20} />
        </div>
        <h3 className="font-mono text-sm uppercase tracking-widest">Saved Summary Files</h3>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading saved summary files...</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-zinc-500">No saved summary files yet. Export a summary to persist it here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-230">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">No.</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Filename</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Course</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Scope</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Rows</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Saved At</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((file, index) => (
                <tr key={file.id} className="border-b border-zinc-800/50 transition-all hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-zinc-200">{file.filename}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{getCourseLabel(file)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{getScopeLabel(file)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{file.row_count}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{formatDateTime(file.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="inline-flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-mono uppercase text-sky-400 transition-all hover:bg-sky-500/20"
                    >
                      <Download size={12} />
                      Reopen
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