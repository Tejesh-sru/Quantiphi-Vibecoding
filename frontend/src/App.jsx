import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import FilterSidebar from './components/Filters/FilterSidebar';
import SortDropdown from './components/Filters/SortDropdown';
import ProductGrid from './components/Products/ProductGrid';
import { useDebounce } from './hooks/useDebounce';
import { fetchProducts, fetchProductMeta } from './api/productApi';
import './styles/App.css';

const DEFAULT_BOUNDS = { min: 0, max: 2000 };

export default function App() {
  // Catalog Bounds (Dynamically retrieved from backend /api/products/meta)
  const [priceBounds, setPriceBounds] = useState(DEFAULT_BOUNDS);

  // Filter States
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(DEFAULT_BOUNDS);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating_desc');

  // Debounced price range (300ms) to avoid spamming the backend during slider drags
  const debouncedPriceRange = useDebounce(priceRange, 300);

  // Products and Request State
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1. Initial Load: Fetch Catalog Metadata (Min/Max price bounds from MongoDB)
  useEffect(() => {
    const controller = new AbortController();

    async function loadMeta() {
      try {
        const meta = await fetchProductMeta(controller.signal);
        if (meta && meta.priceBounds) {
          const bounds = {
            min: meta.priceBounds.absoluteMin || 0,
            max: meta.priceBounds.absoluteMax || 2000,
          };
          setPriceBounds(bounds);
          setPriceRange(bounds);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && !controller.signal.aborted) {
          console.warn('Could not fetch catalog metadata (backend may still be starting):', err.message);
        }
      }
    }

    loadMeta();
    return () => controller.abort();
  }, []);

  // 2. Fetch Filtered Products from Backend whenever filters change
  const loadFilteredProducts = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProducts(
        {
          categories,
          minPrice: debouncedPriceRange.min,
          maxPrice: debouncedPriceRange.max,
          minRating,
          sort: sortBy,
        },
        signal
      );

      if (response && response.data) {
        setProducts(response.data);
        setTotalCount(response.total ?? response.data.length);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || signal.aborted) {
        // Ignored: request canceled by subsequent filter change
        return;
      }
      console.error('Failed to load products:', err);
      setError(
        err.response?.data?.message ||
        'Unable to connect to the backend API server. Please ensure the Node.js backend is running on port 5000.'
      );
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [categories, debouncedPriceRange, minRating, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    loadFilteredProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadFilteredProducts]);

  // Reset all filters to default state
  const handleResetFilters = useCallback(() => {
    setCategories([]);
    setPriceRange(priceBounds);
    setMinRating(0);
    setSortBy('rating_desc');
  }, [priceBounds]);

  // Remove individual category chip
  const handleRemoveCategory = (catToRemove) => {
    setCategories((prev) => prev.filter((c) => c !== catToRemove));
  };

  // Check if any filters are active compared to base defaults
  const activeChips = useMemo(() => {
    const chips = [];
    categories.forEach((c) => {
      chips.push({
        type: 'category',
        label: `Category: ${c}`,
        onRemove: () => handleRemoveCategory(c),
      });
    });

    if (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max) {
      chips.push({
        type: 'price',
        label: `$${priceRange.min} – $${priceRange.max}`,
        onRemove: () => setPriceRange(priceBounds),
      });
    }

    if (minRating > 0) {
      chips.push({
        type: 'rating',
        label: `${minRating}★ & above`,
        onRemove: () => setMinRating(0),
      });
    }

    return chips;
  }, [categories, priceRange, priceBounds, minRating]);

  return (
    <div className="app-root">
      <Navbar />

      <main className="app-container">
        {/* Mobile toggle button */}
        <div className="mobile-filter-bar">
          <button
            type="button"
            className="btn-mobile-toggle"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <span>{isMobileSidebarOpen ? 'Hide Filters' : 'Show Filters'}</span>
            <span>{activeChips.length > 0 ? `(${activeChips.length} active)` : ''}</span>
          </button>
        </div>

        <div className="main-layout">
          {/* Left: Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            onCategoryChange={setCategories}
            priceBounds={priceBounds}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            rating={minRating}
            onRatingChange={setMinRating}
            onResetAll={handleResetFilters}
            isOpen={isMobileSidebarOpen}
          />

          {/* Right: Content Area */}
          <section className="content-area">
            {/* Top Bar with Results Count & Sort Dropdown */}
            <div className="content-top-bar">
              <div className="results-info">
                <span className="results-count">{isLoading ? '...' : totalCount}</span>
                <span className="results-label">
                  {totalCount === 1 ? 'Product found' : 'Products found'}
                </span>
              </div>

              <SortDropdown currentSort={sortBy} onChange={setSortBy} />
            </div>

            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="active-chips-row" aria-label="Active filters">
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                  Active:
                </span>
                {activeChips.map((chip, index) => (
                  <span key={index} className="filter-chip">
                    {chip.label}
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={chip.onRemove}
                      aria-label={`Remove filter ${chip.label}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Backend Connectivity Banner (shows only if connection error occurs) */}
            {error && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  color: '#991b1b',
                  fontSize: '0.9rem',
                }}
              >
                <strong>Backend Notice:</strong> {error}
              </div>
            )}

            {/* Product Grid or Empty State */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
