import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Functional Test Suite for Frontend Filter Algorithms and State Transitions
 */
describe('Frontend Filter Functional & Business Invariants Test Suite', () => {
  // 1. Dual Price Slider Invariant Enforcement
  describe('Dual Price Slider Logic', () => {
    const minBound = 0;
    const maxBound = 2000;

    const clampMinPrice = (newVal, currentMax) => {
      return Math.min(newVal, currentMax);
    };

    const clampMaxPrice = (newVal, currentMin) => {
      return Math.max(newVal, currentMin);
    };

    const computeRangePercentages = (safeMin, safeMax, min = 0, max = 2000) => {
      const minPercent = Math.min(100, Math.max(0, Math.round(((safeMin - min) / (max - min)) * 100)));
      const maxPercent = Math.min(100, Math.max(0, Math.round(((safeMax - min) / (max - min)) * 100)));
      return { minPercent, maxPercent, trackWidth: maxPercent - minPercent };
    };

    it('should clamp minPrice so it NEVER exceeds maxPrice', () => {
      const currentMax = 500;
      const attemptedMin = 650; // User drags min past max
      const safeMin = clampMinPrice(attemptedMin, currentMax);

      assert.equal(safeMin, 500, 'minPrice must be clamped to currentMax');
      assert.ok(safeMin <= currentMax, 'Invariant violated: minPrice > maxPrice');
    });

    it('should clamp maxPrice so it NEVER falls below minPrice', () => {
      const currentMin = 300;
      const attemptedMax = 150; // User drags max below min
      const safeMax = clampMaxPrice(attemptedMax, currentMin);

      assert.equal(safeMax, 300, 'maxPrice must be clamped to currentMin');
      assert.ok(safeMax >= currentMin, 'Invariant violated: maxPrice < minPrice');
    });

    it('should accurately compute track highlight percentage coordinates', () => {
      const coords = computeRangePercentages(500, 1500, minBound, maxBound);
      assert.equal(coords.minPercent, 25);
      assert.equal(coords.maxPercent, 75);
      assert.equal(coords.trackWidth, 50);
    });
  });

  // 2. Category Multi-Selection Toggle Logic
  describe('Category Filter Multi-Selection Toggle', () => {
    const toggleCategory = (currentList, category) => {
      if (currentList.includes(category)) {
        return currentList.filter((c) => c !== category);
      }
      return [...currentList, category];
    };

    it('should add category when not previously present', () => {
      const initial = ['Electronics'];
      const updated = toggleCategory(initial, 'Footwear');
      assert.deepEqual(updated, ['Electronics', 'Footwear']);
    });

    it('should remove category when already selected', () => {
      const initial = ['Electronics', 'Footwear', 'Apparel'];
      const updated = toggleCategory(initial, 'Footwear');
      assert.deepEqual(updated, ['Electronics', 'Apparel']);
    });

    it('should return empty list when all categories are deselected', () => {
      let selected = ['Apparel'];
      selected = toggleCategory(selected, 'Apparel');
      assert.equal(selected.length, 0);
    });
  });

  // 3. Customer Rating Selection
  describe('Rating Filter State Transitions', () => {
    const handleRatingSelect = (selectedVal) => {
      return Number(selectedVal) || 0;
    };

    it('should select minimum rating between 1 and 5', () => {
      assert.equal(handleRatingSelect(4), 4);
      assert.equal(handleRatingSelect('5'), 5);
    });

    it('should reset rating filter to 0 on clear', () => {
      assert.equal(handleRatingSelect(0), 0);
      assert.equal(handleRatingSelect(null), 0);
    });
  });

  // 4. API Query Parameter Serialization
  describe('API Query Parameter Serialization', () => {
    const serializeFiltersToQuery = (filters) => {
      const params = new URLSearchParams();
      if (filters.categories && filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.minRating !== undefined && filters.minRating > 0) {
        params.append('minRating', filters.minRating);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      return params.toString();
    };

    it('should generate valid query string for backend API', () => {
      const state = {
        categories: ['Electronics', 'Home & Kitchen'],
        minPrice: 100,
        maxPrice: 600,
        minRating: 4,
        sortBy: 'price_asc'
      };

      const queryString = serializeFiltersToQuery(state);
      assert.ok(queryString.includes('categories=Electronics%2CHome+%26+Kitchen'));
      assert.ok(queryString.includes('minPrice=100'));
      assert.ok(queryString.includes('maxPrice=600'));
      assert.ok(queryString.includes('minRating=4'));
      assert.ok(queryString.includes('sortBy=price_asc'));
    });

    it('should omit unset or default filter parameters', () => {
      const state = {
        categories: [],
        minRating: 0,
        sortBy: 'rating_desc'
      };
      const queryString = serializeFiltersToQuery(state);
      assert.ok(!queryString.includes('categories='));
      assert.ok(!queryString.includes('minRating='));
      assert.ok(queryString.includes('sortBy=rating_desc'));
    });
  });
});
