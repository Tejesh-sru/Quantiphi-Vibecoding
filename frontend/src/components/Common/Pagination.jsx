import React from 'react';

/**
 * Pagination Component
 * Displays server-driven pagination controls and page numbers
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  limit = 8,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * limit + 1, totalCount);
  const endItem = Math.min(currentPage * limit, totalCount);

  // Generate page numbers with ellipsis support for many pages
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="pagination-wrapper" aria-label="Product catalog navigation">
      <div className="pagination-summary">
        Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalCount}</strong> products
      </div>

      <div className="pagination-controls">
        {/* Previous Page Button */}
        <button
          type="button"
          className="btn-page-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          &larr; Prev
        </button>

        {/* Numeric Page Buttons */}
        <div className="page-numbers-group">
          {getPageNumbers().map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  &hellip;
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                className={`btn-page-number ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          className="btn-page-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          Next &rarr;
        </button>
      </div>
    </nav>
  );
}
