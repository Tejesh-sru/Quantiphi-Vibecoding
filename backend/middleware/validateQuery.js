import { AppError } from './errorHandler.js';
import { ALLOWED_CATEGORIES } from '../models/Product.js';

export const VALID_SORT_OPTIONS = ['price_asc', 'price_desc', 'rating_desc'];

/**
 * Validates and sanitizes incoming product search, filtering, and pagination query parameters.
 * Rejects negative prices, inverted price ranges, invalid ratings, unsupported sort options,
 * and malformed pagination bounds.
 */
export const validateProductQuery = (req, res, next) => {
  const {
    search,
    categories,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    sort,
    page,
    limit,
  } = req.query;

  const validated = {};

  // 1. Validate 'search' (Product search by name)
  if (search !== undefined && search !== null && search !== '') {
    if (typeof search !== 'string') {
      return next(new AppError('Search parameter must be a string', 400));
    }
    const trimmed = search.trim();
    if (trimmed.length > 100) {
      return next(new AppError('Search query cannot exceed 100 characters', 400));
    }
    if (trimmed.length > 0) {
      validated.search = trimmed;
    }
  }

  // 2. Validate 'categories'
  if (categories !== undefined && categories !== null && categories !== '') {
    if (typeof categories !== 'string') {
      return next(new AppError('Query parameter "categories" must be a comma-separated string', 400));
    }

    const categoryList = categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (categoryList.length > 0) {
      const invalidCategories = categoryList.filter((c) => !ALLOWED_CATEGORIES.includes(c));
      if (invalidCategories.length > 0) {
        return next(
          new AppError(
            `Invalid category: ${invalidCategories.join(', ')}. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`,
            400
          )
        );
      }
      validated.categories = categoryList;
    }
  }

  // 3. Validate 'minPrice'
  if (minPrice !== undefined && minPrice !== '') {
    const parsedMinPrice = Number(minPrice);
    if (!Number.isFinite(parsedMinPrice) || isNaN(parsedMinPrice)) {
      return next(new AppError('Parameter "minPrice" must be a valid numeric value', 400));
    }
    if (parsedMinPrice < 0) {
      return next(new AppError('Minimum price cannot be a negative value', 400));
    }
    validated.minPrice = parsedMinPrice;
  }

  // 4. Validate 'maxPrice'
  if (maxPrice !== undefined && maxPrice !== '') {
    const parsedMaxPrice = Number(maxPrice);
    if (!Number.isFinite(parsedMaxPrice) || isNaN(parsedMaxPrice)) {
      return next(new AppError('Parameter "maxPrice" must be a valid numeric value', 400));
    }
    if (parsedMaxPrice < 0) {
      return next(new AppError('Maximum price cannot be a negative value', 400));
    }
    validated.maxPrice = parsedMaxPrice;
  }

  // 5. Invariant: Minimum price must not exceed maximum price
  if (validated.minPrice !== undefined && validated.maxPrice !== undefined) {
    if (validated.minPrice > validated.maxPrice) {
      return next(
        new AppError('Minimum price cannot be greater than maximum price', 400)
      );
    }
  }

  // 6. Validate 'minRating'
  if (minRating !== undefined && minRating !== '') {
    const parsedRating = Number(minRating);
    if (!Number.isFinite(parsedRating) || isNaN(parsedRating)) {
      return next(new AppError('Parameter "minRating" must be a valid numeric value', 400));
    }
    if (parsedRating < 1 || parsedRating > 5) {
      return next(new AppError('Minimum rating must be between 1 and 5 stars', 400));
    }
    validated.minRating = parsedRating;
  }

  // 7. Validate 'sortBy'
  const sortParam = sortBy || sort;
  if (sortParam !== undefined && sortParam !== '') {
    if (!VALID_SORT_OPTIONS.includes(sortParam)) {
      return next(
        new AppError(
          `Invalid sort option "${sortParam}". Allowed values: ${VALID_SORT_OPTIONS.join(', ')}`,
          400
        )
      );
    }
    validated.sortBy = sortParam;
  } else {
    validated.sortBy = 'rating_desc'; // Default sorting
  }

  // 8. Validate 'page' (Server-side pagination)
  if (page !== undefined && page !== '') {
    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return next(new AppError('Page parameter must be a positive integer greater than or equal to 1', 400));
    }
    validated.page = parsedPage;
  } else {
    validated.page = 1;
  }

  // 9. Validate 'limit' (Server-side pagination limit)
  if (limit !== undefined && limit !== '') {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return next(new AppError('Limit parameter must be an integer between 1 and 50', 400));
    }
    validated.limit = parsedLimit;
  } else {
    validated.limit = 8; // Default 8 items per page
  }

  // Store sanitized values for controller use
  req.validatedQuery = validated;
  next();
};
