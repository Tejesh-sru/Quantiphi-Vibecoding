import Product, { ALLOWED_CATEGORIES } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all products with server-side multi-filtering and sorting
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { categories, minPrice, maxPrice, minRating, sortBy } = req.validatedQuery;

    // 1. Construct MongoDB Query Filter Object (combines active filters using AND logic)
    const filterConditions = {};

    // Condition A: Category filtering ($in matches any selected category)
    if (categories && categories.length > 0) {
      filterConditions.category = { $in: categories };
    }

    // Condition B: Price filtering (between minPrice and maxPrice)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filterConditions.price = {};
      if (minPrice !== undefined) {
        filterConditions.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filterConditions.price.$lte = maxPrice;
      }
    }

    // Condition C: Rating filtering (rating >= minRating)
    if (minRating !== undefined) {
      filterConditions.rating = { $gte: minRating };
    }

    // 2. Sorting mapping (Executed strictly after filtering in the DB pipeline)
    const sortCriteriaMap = {
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: 1 },
      rating_desc: { rating: -1, price: 1, _id: 1 }
    };

    const selectedSort = sortCriteriaMap[sortBy] || sortCriteriaMap.rating_desc;

    // 3. Execute Query against MongoDB
    const products = await Product.find(filterConditions).sort(selectedSort);

    // 4. Return formatted JSON response
    res.status(200).json({
      success: true,
      count: products.length,
      products,
      data: products // Included for seamless compatibility with frontend client consumers
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
      categories: ALLOWED_CATEGORIES
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
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    const bounds = stats.length > 0
      ? {
          absoluteMin: Math.floor(stats[0].minPrice || 0),
          absoluteMax: Math.ceil(stats[0].maxPrice || 2000)
        }
      : { absoluteMin: 0, absoluteMax: 2000 };

    res.status(200).json({
      success: true,
      categories: ALLOWED_CATEGORIES,
      priceBounds: bounds,
      totalCount: stats[0]?.totalProducts || 0
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
      product
    });
  } catch (error) {
    next(error);
  }
};
