import React from 'react';

/**
 * EmptyState component displayed when no products match the current filters.
 */
export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state-card" role="region" aria-label="No results">
      <div className="empty-icon-wrap" aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>

      <h3 className="empty-title">No items match your criteria</h3>
      <p className="empty-description">
        Try broadening your category selections, widening your price range, or lowering the minimum star rating.
      </p>

      <button
        type="button"
        className="btn-reset-filters"
        onClick={onReset}
      >
        Reset Filters
      </button>
    </div>
  );
}
