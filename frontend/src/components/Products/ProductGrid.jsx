import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

/**
 * ProductGrid handles displaying product cards, skeleton loaders, or the empty state.
 */
export default function ProductGrid({
  products = [],
  isLoading = false,
  onResetFilters,
}) {
  if (isLoading) {
    return (
      <div className="products-grid">
        {[...Array(6)].map((_, i) => (
          <div key={`skeleton-${i}`} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-img" />
            <div className="skeleton-body">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" style={{ marginTop: '1.5rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
}
