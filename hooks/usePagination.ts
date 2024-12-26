import { useState, useEffect, useMemo } from "react";

export default function usePagination(source : Array<any> = [], itemsPerPage = 6) {
  if (!Array.isArray(source)) {
    throw new TypeError("The source is not an instance of array type");
  }

  if (typeof itemsPerPage !== "number" || itemsPerPage <= 0) {
    throw new TypeError("itemsPerPage must be a positive number");
  }

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(source.length / itemsPerPage));
  }, [source.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    if (source.length <= itemsPerPage) {
      return source;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return source.slice(startIndex, endIndex);
  }, [source, currentPage, itemsPerPage]);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const previousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const setPage = (page : number) => {
    if (page < 1 || page > totalPages) {
      console.warn("Attempted to set page out of bounds");
      return;
    }
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  return {
    nextPage,
    previousPage,
    setPage,
    data: paginatedData,
    totalPages,
    currentPage,
    itemsPerPage,
  };
}
