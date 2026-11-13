import Product, { ALLOWED_CATEGORIES } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all products with server-side search, multi-filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 *
 * Execution Order:
 * 1. SEARCH: Case-insensitive regex search on product name
 * 2. FILTERING: Category ($in), Price range ($gte, $lte), Minimum Rating ($gte)
 * 3. SORTING: price_asc, price_desc, rating_desc
 * 4. PAGINATION: skip and limit based on page number
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      categories,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page,
      limit,
    } = req.validatedQuery;

    const filterConditions = {};

    // -------------------------------------------------------------
    // STEP 1: SEARCH by product name (Case-insensitive sanitized regex)
    // -------------------------------------------------------------
    if (search) {
      // Escape special regex characters to prevent regex injection / ReDoS
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filterConditions.name = { $regex: escapedSearch, $options: 'i' };
    }

    // -------------------------------------------------------------
    // STEP 2: FILTERING (Category, Price, Rating combined via AND logic)
    // -------------------------------------------------------------
    // 2a. Categories filter ($in matches any of selected categories)
    if (categories && categories.length > 0) {
      filterConditions.category = { $in: categories };
    }

    // 2b. Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filterConditions.price = {};
      if (minPrice !== undefined) {
        filterConditions.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filterConditions.price.$lte = maxPrice;
      }
    }

    // 2c. Minimum Rating filter
    if (minRating !== undefined) {
      filterConditions.rating = { $gte: minRating };
    }

    // -------------------------------------------------------------
    // STEP 3: SORTING (Applied to the filtered dataset)
    // -------------------------------------------------------------
    const sortCriteriaMap = {
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: 1 },
      rating_desc: { rating: -1, price: 1, _id: 1 },
    };

    const selectedSort = sortCriteriaMap[sortBy] || sortCriteriaMap.rating_desc;

    // -------------------------------------------------------------
    // STEP 4: PAGINATION (Skip & Limit with Total Calculations)
    // -------------------------------------------------------------
    // Count total matching products before pagination slicing
    const total = await Product.countDocuments(filterConditions);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    // Execute query with sorting and pagination constraints
    const products = await Product.find(filterConditions)
      .sort(selectedSort)
      .skip(skip)
      .limit(limit);

    // -------------------------------------------------------------
    // STEP 5: RETURN CONSISTENT STRUCTURED RESPONSE
    // -------------------------------------------------------------
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages,
      limit,
      products,
      data: products, // Backward compatibility alias
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available distinct product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: ALLOWED_CATEGORIES.length,
      categories: ALLOWED_CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get catalog metadata (min/max price bounds across inventory)
 * @route   GET /api/products/meta
 * @access  Public
 */
export const getProductMeta = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalProducts: { $sum: 1 },
        },
      },
    ]);

    const bounds =
      stats.length > 0
        ? {
            absoluteMin: Math.floor(stats[0].minPrice || 0),
            absoluteMax: Math.ceil(stats[0].maxPrice || 2000),
          }
        : { absoluteMin: 0, absoluteMax: 2000 };

    res.status(200).json({
      success: true,
      categories: ALLOWED_CATEGORIES,
      priceBounds: bounds,
      totalCount: stats[0]?.totalProducts || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by MongoDB ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError(`No product found with ID: ${id}`, 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
