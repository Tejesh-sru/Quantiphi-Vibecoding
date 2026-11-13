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
 * Fetch products from backend with filters, sorting, and pagination
 * @param {Object} params - { categories, minPrice, maxPrice, minRating, sort, page, limit }
 * @param {AbortSignal} signal - Optional abort signal to cancel in-flight requests
 */
export const fetchProducts = async (params = {}, signal) => {
  const queryParams = new URLSearchParams();

  if (params.categories && params.categories.length > 0) {
    queryParams.append('categories', params.categories.join(','));
  }
  if (params.minPrice !== undefined && params.minPrice !== null) {
    queryParams.append('minPrice', params.minPrice);
  }
  if (params.maxPrice !== undefined && params.maxPrice !== null) {
    queryParams.append('maxPrice', params.maxPrice);
  }
  if (params.minRating !== undefined && params.minRating > 0) {
    queryParams.append('minRating', params.minRating);
  }
  if (params.sortBy || params.sort) {
    queryParams.append('sortBy', params.sortBy || params.sort);
  }
  if (params.page) {
    queryParams.append('page', params.page);
  }
  if (params.limit) {
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
