import React, { useId } from 'react';

/**
 * DualPriceSlider component provides a robust dual-range slider.
 * Invariant: minPrice <= maxPrice at all times.
 */
export default function DualPriceSlider({
  min = 0,
  max = 2000,
  step = 10,
  minPrice,
  maxPrice,
  onChange,
}) {
  const minInputId = useId();
  const maxInputId = useId();

  // Enforce boundary safety
  const safeMinPrice = Math.max(min, Math.min(minPrice, maxPrice));
  const safeMaxPrice = Math.min(max, Math.max(maxPrice, minPrice));

  // Compute percentage positions for the active range highlight track
  const minPercent = Math.min(100, Math.max(0, Math.round(((safeMinPrice - min) / (max - min)) * 100)));
  const maxPercent = Math.min(100, Math.max(0, Math.round(((safeMaxPrice - min) / (max - min)) * 100)));

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    // Minimum price must never exceed maximum price
    const newMin = Math.min(value, safeMaxPrice);
    onChange({ min: newMin, max: safeMaxPrice });
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    // Maximum price must never be below minimum price
    const newMax = Math.max(value, safeMinPrice);
    onChange({ min: safeMinPrice, max: newMax });
  };

  return (
    <div className="filter-section">
      <h3 className="section-title">Price Range</h3>

      <div className="slider-container">
        {/* Visual Readout Display */}
        <div className="slider-readout">
          <div className="readout-box">
            <span className="readout-label">Min</span>
            <span className="readout-val">${safeMinPrice.toLocaleString()}</span>
          </div>
          <span className="readout-separator">—</span>
          <div className="readout-box">
            <span className="readout-label">Max</span>
            <span className="readout-val">${safeMaxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Dual Range Track & Thumbs */}
        <div className="range-slider-wrapper">
          {/* Base track */}
          <div className="slider-track" />

          {/* Highlighted active range bar */}
          <div
            className="slider-highlight-range"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Range Slider Min Handle */}
          <input
            id={minInputId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeMinPrice}
            onChange={handleMinChange}
            className="range-input range-input-min"
            aria-label="Minimum price"
            style={{ zIndex: safeMinPrice > max - 100 ? 5 : 3 }}
          />

          {/* Range Slider Max Handle */}
          <input
            id={maxInputId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeMaxPrice}
            onChange={handleMaxChange}
            className="range-input range-input-max"
            aria-label="Maximum price"
            style={{ zIndex: 4 }}
          />
        </div>

        {/* Global Catalog Bounds Hint */}
        <div className="slider-bounds-hint">
          <span>${min}</span>
          <span>${max.toLocaleString()}+</span>
        </div>
      </div>
    </div>
  );
}
