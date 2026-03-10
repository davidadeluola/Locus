export default function PaginationControls({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  prevPage,
  nextPage,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={prevPage}
        disabled={!hasPrevPage}
        className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-xs font-mono text-zinc-500">Page {currentPage} / {totalPages}</span>
      <button
        onClick={nextPage}
        disabled={!hasNextPage}
        className="px-3 py-1 text-xs font-mono border border-zinc-700 rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}