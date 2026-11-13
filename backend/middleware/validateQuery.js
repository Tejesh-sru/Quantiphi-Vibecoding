import { AppError } from './errorHandler.js';
import { ALLOWED_CATEGORIES } from '../models/Product.js';

export const VALID_SORT_OPTIONS = ['price_asc', 'price_desc', 'rating_desc'];

/**
 * Validates and sanitizes incoming product search query parameters.
 * Rejects negative prices, inverted price ranges, invalid ratings, and unsupported sort options.
 */
export const validateProductQuery = (req, res, next) => {
  const { categories, minPrice, maxPrice, minRating, sortBy, sort } = req.query;

  const validated = {};

  // 1. Validate 'categories'
  if (categories !== undefined && categories !== null && categories !== '') {
    if (typeof categories !== 'string') {
      return next(new AppError('Query parameter "categories" must be a comma-separated string', 400));
    }

    const categoryList = categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (categoryList.length > 0) {
      // Ensure all requested categories exist in allowed categories list
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

  // 2. Validate 'minPrice'
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

  // 3. Validate 'maxPrice'
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

  // 4. Invariant: Minimum price must not exceed maximum price
  if (validated.minPrice !== undefined && validated.maxPrice !== undefined) {
    if (validated.minPrice > validated.maxPrice) {
      return next(
        new AppError('Minimum price cannot be greater than maximum price', 400)
      );
    }
  }

  // 5. Validate 'minRating'
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

  // 6. Validate 'sortBy' (support both 'sortBy' and 'sort' parameters)
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
    validated.sortBy = 'rating_desc'; // Default sorting strategy
  }

  // Store sanitized values for controller use
  req.validatedQuery = validated;
  next();
};
