import express from 'express';
import {
  getProducts,
  getCategories,
  getProductMeta,
  getProductById
} from '../controllers/productController.js';
import { validateProductQuery } from '../middleware/validateQuery.js';

const router = express.Router();

// Specific routes first to prevent collision with parameter wildcard :id
router.get('/categories', getCategories);
router.get('/meta', getProductMeta);

// Collection root route with query validation middleware
router.get('/', validateProductQuery, getProducts);

// Single resource route
router.get('/:id', getProductById);

export default router;
