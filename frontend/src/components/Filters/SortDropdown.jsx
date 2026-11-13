import React from 'react';

export const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Top Rated First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

/**
 * SortDropdown component handles sorting options.
 */
export default function SortDropdown({ currentSort = 'rating_desc', onChange }) {
  return (
    <div className="sort-group">
      <label htmlFor="product-sort-select" className="sort-label">
        Sort by:
      </label>
      <select
        id="product-sort-select"
        value={currentSort}
        onChange={(e) => onChange(e.target.value)}
        className="sort-select"
        aria-label="Sort products by"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
