import React from 'react';
import StarRating from '../Common/StarRating';

const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars & above' },
  { value: 3, label: '3 Stars & above' },
  { value: 2, label: '2 Stars & above' },
  { value: 1, label: '1 Star & above' },
];

/**
 * RatingFilter component renders radio buttons for minimum rating selection (1 to 5 stars).
 */
export default function RatingFilter({ selectedRating = 0, onChange }) {
  return (
    <div className="filter-section">
      <h3 className="section-title">Customer Rating</h3>
      <div className="rating-list" role="radiogroup" aria-label="Filter by minimum star rating">
        {RATING_OPTIONS.map((option) => {
          const isSelected = Number(selectedRating) === option.value;
          return (
            <label
              key={option.value}
              className={`rating-item ${isSelected ? 'checked' : ''}`}
            >
              <input
                type="radio"
                name="rating-filter"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
              />
              <div className="rating-stars-label">
                <StarRating rating={option.value} showScore={false} />
                <span>{option.label}</span>
              </div>
            </label>
          );
        })}

        {/* Option to clear rating filter */}
        {selectedRating > 0 && (
          <label className="rating-item">
            <input
              type="radio"
              name="rating-filter"
              value={0}
              checked={false}
              onChange={() => onChange(0)}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)' }}>
              All Ratings (Clear)
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
