import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import FilterSidebar from './components/Filters/FilterSidebar';
import SortDropdown from './components/Filters/SortDropdown';
import SearchBar from './components/Common/SearchBar';
import Pagination from './components/Common/Pagination';
import ProductGrid from './components/Products/ProductGrid';
import { useDebounce } from './hooks/useDebounce';
import { fetchProducts, fetchProductMeta } from './api/productApi';
import './styles/App.css';

const DEFAULT_BOUNDS = { min: 0, max: 2000 };
const PAGE_LIMIT = 8; // 8 items per page for clean pagination with 35 items

export default function App() {
  // Catalog Bounds (Dynamically retrieved from backend /api/products/meta)
  const [priceBounds, setPriceBounds] = useState(DEFAULT_BOUNDS);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(DEFAULT_BOUNDS);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating_desc');

  // Server-side Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced inputs (300ms) to prevent excessive backend queries during rapid user typing/sliding
  const debouncedPriceRange = useDebounce(priceRange, 300);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Products and Request State
  const [products, setProducts] = useState([]);
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
          console.warn('Could not fetch catalog metadata:', err.message);
        }
      }
    }

    loadMeta();
    return () => controller.abort();
  }, []);

  // 2. Automatically reset to page 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categories, debouncedPriceRange, minRating, sortBy]);

  // 3. Fetch Filtered, Sorted, and Paginated Products from Backend
  const loadFilteredProducts = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProducts(
        {
          search: debouncedSearch,
          categories,
          minPrice: debouncedPriceRange.min,
          maxPrice: debouncedPriceRange.max,
          minRating,
          sortBy,
          page: currentPage,
          limit: PAGE_LIMIT,
        },
        signal
      );

      if (response && (response.products || response.data)) {
        const productList = response.products || response.data;
        setProducts(productList);
        setTotalCount(response.total ?? productList.length);
        setTotalPages(response.totalPages ?? 1);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || signal.aborted) {
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
  }, [debouncedSearch, categories, debouncedPriceRange, minRating, sortBy, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    loadFilteredProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadFilteredProducts]);

  // 4. Reset all filters and search back to pristine initial state
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setCategories([]);
    setPriceRange(priceBounds);
    setMinRating(0);
    setSortBy('rating_desc');
    setCurrentPage(1);
  }, [priceBounds]);

  // Remove individual category chip
  const handleRemoveCategory = (catToRemove) => {
    setCategories((prev) => prev.filter((c) => c !== catToRemove));
  };

  // 5. Active Filter Chips computation
  const activeChips = useMemo(() => {
    const chips = [];

    // Search query chip
    if (searchTerm.trim()) {
      chips.push({
        id: 'search',
        type: 'search',
        label: `Search: "${searchTerm.trim()}"`,
        onRemove: () => setSearchTerm(''),
      });
    }

    // Category chips
    categories.forEach((c) => {
      chips.push({
        id: `cat-${c}`,
        type: 'category',
        label: `Category: ${c}`,
        onRemove: () => handleRemoveCategory(c),
      });
    });

    // Price range chip
    if (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max) {
      chips.push({
        id: 'price',
        type: 'price',
        label: `$${priceRange.min} – $${priceRange.max}`,
        onRemove: () => setPriceRange(priceBounds),
      });
    }

    // Minimum rating chip
    if (minRating > 0) {
      chips.push({
        id: 'rating',
        type: 'rating',
        label: `${minRating}★ & above`,
        onRemove: () => setMinRating(0),
      });
    }

    return chips;
  }, [searchTerm, categories, priceRange, priceBounds, minRating]);

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
            searchTerm={searchTerm}
            onResetAll={handleResetFilters}
            isOpen={isMobileSidebarOpen}
          />

          {/* Right: Content Area */}
          <section className="content-area">
            {/* Top Bar with SearchBar, Results Count, and Sort Dropdown */}
            <div className="content-top-bar">
              {/* Product search input */}
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="results-info">
                  <span className="results-count">{isLoading ? '...' : totalCount}</span>
                  <span className="results-label">
                    {totalCount === 1 ? 'Product found' : 'Products found'}
                  </span>
                  {totalPages > 1 && (
                    <span className="results-pages-badge">
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>

                <SortDropdown currentSort={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Active Filter Chips with Individual Removal and Clear All */}
            {activeChips.length > 0 && (
              <div className="active-chips-row" aria-label="Active filters">
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                  Active Filters:
                </span>
                {activeChips.map((chip) => (
                  <span key={chip.id} className="filter-chip">
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
                <button
                  type="button"
                  className="btn-clear-all-chips"
                  onClick={handleResetFilters}
                >
                  Clear All
                </button>
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
                <strong>Notice:</strong> {error}
              </div>
            )}

            {/* Product Grid or Empty State with Loading Skeletons */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
            />

            {/* Server-Side Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={PAGE_LIMIT}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
