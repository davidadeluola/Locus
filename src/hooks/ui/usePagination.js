import { useMemo, useState, useEffect } from 'react';

export default function usePagination(items = [], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage,
    prevPage,
    goToPage,
  };
}
