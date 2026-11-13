import React from 'react';
import CategoryFilter from './CategoryFilter';
import DualPriceSlider from './DualPriceSlider';
import RatingFilter from './RatingFilter';

/**
 * FilterSidebar component aggregates category, price, and rating filters.
 */
export default function FilterSidebar({
  categories = [],
  onCategoryChange,
  priceBounds = { min: 0, max: 2000 },
  priceRange = { min: 0, max: 2000 },
  onPriceChange,
  rating = 0,
  onRatingChange,
  searchTerm = '',
  onResetAll,
  isOpen = false,
}) {
  // Compute how many active filters are applied
  let activeCount = 0;
  if (searchTerm && searchTerm.trim()) activeCount += 1;
  if (categories.length > 0) activeCount += categories.length;
  if (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max) activeCount += 1;
  if (rating > 0) activeCount += 1;

  const hasActiveFilters = activeCount > 0;

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`} aria-label="Filters">
      <div className="sidebar-header">
        <div className="sidebar-title-group">
          <h2 className="sidebar-title">Filters</h2>
          {hasActiveFilters && (
            <span className="active-count-badge">{activeCount}</span>
          )}
        </div>
        <button
          type="button"
          className="btn-clear-filters"
          onClick={onResetAll}
          disabled={!hasActiveFilters}
          title="Reset all active filters"
        >
          Reset All
        </button>
      </div>

      {/* Category Checkbox Multi-Selection */}
      <CategoryFilter
        selectedCategories={categories}
        onChange={onCategoryChange}
      />

      {/* Dual Range Price Slider */}
      <DualPriceSlider
        min={priceBounds.min}
        max={priceBounds.max}
        step={10}
        minPrice={priceRange.min}
        maxPrice={priceRange.max}
        onChange={onPriceChange}
      />

      {/* Minimum Rating Radio Buttons */}
      <RatingFilter
        selectedRating={rating}
        onChange={onRatingChange}
      />
    </aside>
  );
}
