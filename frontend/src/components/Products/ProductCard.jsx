import React from 'react';
import StarRating from '../Common/StarRating';

/**
 * ProductCard component displays individual product attributes.
 */
export default function ProductCard({ product }) {
  const {
    name,
    category,
    price = 0,
    rating = 0,
    numReviews = 0,
    imageUrl,
    inStock = true,
  } = product;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            // High-quality fallback image if external URL fails
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <span className="category-badge-chip">{category}</span>
      </div>

      <div className="product-card-body">
        <h3 className="product-title" title={name}>
          {name}
        </h3>

        <div className="product-rating-row">
          <StarRating rating={rating} reviewsCount={numReviews} />
        </div>

        <div className="product-footer">
          <div className="product-price-wrapper">
            <span className="price-currency">USD</span>
            <span className="product-price">${Number(price).toFixed(2)}</span>
          </div>
          {inStock ? (
            <span className="stock-indicator">In Stock</span>
          ) : (
            <span className="stock-indicator" style={{ color: 'var(--gray-500)', backgroundColor: 'var(--gray-100)' }}>
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
