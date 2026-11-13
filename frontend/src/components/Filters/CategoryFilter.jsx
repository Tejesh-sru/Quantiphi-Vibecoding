import React from 'react';

export const CATEGORIES = [
  'Electronics',
  'Apparel',
  'Footwear',
  'Home & Kitchen',
  'Accessories'
];

/**
 * CategoryFilter component allows multiple category selections via checkboxes.
 */
export default function CategoryFilter({ selectedCategories = [], onChange }) {
  const handleToggle = (category) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="filter-section">
      <h3 className="section-title">Categories</h3>
      <div className="category-list" role="group" aria-label="Category filter">
        {CATEGORIES.map((category) => {
          const isChecked = selectedCategories.includes(category);
          return (
            <label
              key={category}
              className={`category-item ${isChecked ? 'checked' : ''}`}
            >
              <div className="category-label-group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(category)}
                  aria-label={`Filter by ${category}`}
                />
                <span className="category-name">{category}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
