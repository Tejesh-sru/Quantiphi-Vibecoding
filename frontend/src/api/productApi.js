import axios from 'axios';

// Base Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch products from backend with search, filters, sorting, and pagination
 * @param {Object} params - { search, categories, minPrice, maxPrice, minRating, sortBy, page, limit }
 * @param {AbortSignal} signal - Optional abort signal to cancel in-flight requests
 */
export const fetchProducts = async (params = {}, signal) => {
  const queryParams = new URLSearchParams();

  // 1. Search Query
  if (params.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }

  // 2. Multi-Categories
  if (params.categories && params.categories.length > 0) {
    queryParams.append('categories', params.categories.join(','));
  }

  // 3. Price Bounds
  if (params.minPrice !== undefined && params.minPrice !== null) {
    queryParams.append('minPrice', params.minPrice);
  }
  if (params.maxPrice !== undefined && params.maxPrice !== null) {
    queryParams.append('maxPrice', params.maxPrice);
  }

  // 4. Minimum Rating
  if (params.minRating !== undefined && params.minRating > 0) {
    queryParams.append('minRating', params.minRating);
  }

  // 5. Sorting
  if (params.sortBy || params.sort) {
    queryParams.append('sortBy', params.sortBy || params.sort);
  }

  // 6. Pagination parameters
  if (params.page !== undefined && params.page !== null) {
    queryParams.append('page', params.page);
  }
  if (params.limit !== undefined && params.limit !== null) {
    queryParams.append('limit', params.limit);
  }

  const response = await apiClient.get(`/products?${queryParams.toString()}`, { signal });
  return response.data;
};

/**
 * Fetch catalog metadata (price bounds, available categories)
 */
export const fetchProductMeta = async (signal) => {
  const response = await apiClient.get('/products/meta', { signal });
  return response.data;
};

export default apiClient;
