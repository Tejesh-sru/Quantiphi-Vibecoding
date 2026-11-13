import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';
import connectDB from '../config/db.js';
import Product, { ALLOWED_CATEGORIES } from '../models/Product.js';
import { realisticProducts } from '../seeds/seedProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

describe('E-Commerce Multi-Filter REST API Test Suite', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(realisticProducts);
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  // 1. System Health Check
  describe('GET /api/health', () => {
    it('should return 200 OK and uptime timestamp', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.ok(res.body.timestamp);
    });
  });

  // 2. Categories Endpoint
  describe('GET /api/products/categories', () => {
    it('should return list of all 5 supported product categories', async () => {
      const res = await request(app).get('/api/products/categories');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 5);
      assert.deepEqual(res.body.categories, ALLOWED_CATEGORIES);
    });
  });

  // 3. Catalog Metadata Endpoint
  describe('GET /api/products/meta', () => {
    it('should return catalog price bounds and total count', async () => {
      const res = await request(app).get('/api/products/meta');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.priceBounds.absoluteMin >= 0);
      assert.ok(res.body.priceBounds.absoluteMax > res.body.priceBounds.absoluteMin);
      assert.ok(res.body.totalCount > 0);
    });
  });

  // 4. Default Products Query with Pagination Metadata
  describe('GET /api/products (Default state & Pagination)', () => {
    it('should return default paginated products with total and totalPages', async () => {
      const res = await request(app).get('/api/products');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.total >= 35);
      assert.equal(res.body.page, 1);
      assert.equal(res.body.limit, 8);
      assert.equal(res.body.totalPages, Math.ceil(res.body.total / 8));
      assert.equal(res.body.products.length, Math.min(8, res.body.total));

      // Verify product schema contracts
      const sample = res.body.products[0];
      assert.ok(sample._id);
      assert.ok(sample.name);
      assert.ok(sample.category);
      assert.ok(sample.price !== undefined);
      assert.ok(sample.rating !== undefined);
      assert.ok(sample.image);
    });

    it('should paginate to page 2 and return distinct products from page 1', async () => {
      const page1Res = await request(app).get('/api/products?page=1&limit=8');
      const page2Res = await request(app).get('/api/products?page=2&limit=8');

      assert.equal(page1Res.status, 200);
      assert.equal(page2Res.status, 200);
      assert.equal(page2Res.body.page, 2);

      const page1Ids = page1Res.body.products.map((p) => p._id);
      const page2Ids = page2Res.body.products.map((p) => p._id);

      // Verify no overlap between page 1 and page 2
      page2Ids.forEach((id) => {
        assert.ok(!page1Ids.includes(id), `Page 2 item ${id} should not appear on page 1`);
      });
    });
  });

  // 5. Backend Search by Product Name
  describe('Backend Product Search by Name', () => {
    it('should return products matching name keyword (case-insensitive "sony")', async () => {
      const res = await request(app).get('/api/products?search=sony');
      assert.equal(res.status, 200);
      assert.ok(res.body.total > 0);
      res.body.products.forEach((p) => {
        assert.match(p.name, /sony/i);
      });
    });

    it('should perform partial word matching ("headphone")', async () => {
      const res = await request(app).get('/api/products?search=headphone');
      assert.equal(res.status, 200);
      assert.ok(res.body.total > 0);
      res.body.products.forEach((p) => {
        assert.match(p.name, /headphone/i);
      });
    });

    it('should safely escape regex special characters in search', async () => {
      const res = await request(app).get('/api/products?search=Sony%20(WH');
      assert.equal(res.status, 200);
      // Ensures server does not crash with regex syntax error
      assert.equal(res.body.success, true);
    });
  });

  // 6. Category Filtering
  describe('Category Filtering', () => {
    it('should filter by a single category (Electronics)', async () => {
      const res = await request(app).get('/api/products?categories=Electronics&limit=50');
      assert.equal(res.status, 200);
      assert.ok(res.body.total > 0);
      res.body.products.forEach((p) => {
        assert.equal(p.category, 'Electronics');
      });
    });

    it('should filter by multiple categories using $in logic (Footwear, Apparel)', async () => {
      const res = await request(app).get('/api/products?categories=Footwear,Apparel&limit=50');
      assert.equal(res.status, 200);
      assert.ok(res.body.total > 0);
      res.body.products.forEach((p) => {
        assert.ok(['Footwear', 'Apparel'].includes(p.category));
      });
    });
  });

  // 7. Price Range Filtering
  describe('Price Range Filtering', () => {
    it('should return products within minPrice and maxPrice inclusive', async () => {
      const min = 50;
      const max = 200;
      const res = await request(app).get(`/api/products?minPrice=${min}&maxPrice=${max}&limit=50`);
      assert.equal(res.status, 200);
      res.body.products.forEach((p) => {
        assert.ok(p.price >= min, `Product price ${p.price} should be >= ${min}`);
        assert.ok(p.price <= max, `Product price ${p.price} should be <= ${max}`);
      });
    });
  });

  // 8. Customer Star Rating Filtering
  describe('Customer Star Rating Filtering', () => {
    it('should return products with rating >= minRating', async () => {
      const minRating = 4;
      const res = await request(app).get(`/api/products?minRating=${minRating}&limit=50`);
      assert.equal(res.status, 200);
      assert.ok(res.body.total > 0);
      res.body.products.forEach((p) => {
        assert.ok(p.rating >= minRating, `Product rating ${p.rating} should be >= ${minRating}`);
      });
    });
  });

  // 9. Multi-Filter Combination with Search, Sorting, and Pagination
  describe('Full Processing Order: Search -> Filter -> Sort -> Pagination', () => {
    it('should execute full chain: search + category + price + rating + sort + pagination', async () => {
      const url = '/api/products?search=Wireless&categories=Electronics&minPrice=50&maxPrice=500&minRating=4&sortBy=price_asc&page=1&limit=5';
      const res = await request(app).get(url);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.total > 0);
      assert.equal(res.body.page, 1);
      assert.ok(res.body.products.length <= 5);

      // Verify every product satisfies all search, filter, and sort criteria
      const items = res.body.products;
      items.forEach((p) => {
        assert.match(p.name, /wireless/i);
        assert.equal(p.category, 'Electronics');
        assert.ok(p.price >= 50 && p.price <= 500);
        assert.ok(p.rating >= 4);
      });

      // Verify price ascending sort
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].price <= items[i + 1].price);
      }
    });
  });

  // 10. Sorting Strategies
  describe('Sorting Strategies', () => {
    it('should sort products by price ascending (price_asc)', async () => {
      const res = await request(app).get('/api/products?sortBy=price_asc&limit=20');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].price <= items[i + 1].price);
      }
    });

    it('should sort products by price descending (price_desc)', async () => {
      const res = await request(app).get('/api/products?sortBy=price_desc&limit=20');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].price >= items[i + 1].price);
      }
    });

    it('should sort products by top rated first (rating_desc)', async () => {
      const res = await request(app).get('/api/products?sortBy=rating_desc&limit=20');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].rating >= items[i + 1].rating);
      }
    });
  });

  // 11. Input Validation & Error Edge Cases
  describe('Input Validation & Error Edge Cases', () => {
    it('should reject negative minPrice with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?minPrice=-15');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /negative value/i);
    });

    it('should reject when minPrice > maxPrice with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?minPrice=500&maxPrice=100');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /cannot be greater than maximum price/i);
    });

    it('should reject minRating > 5 with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?minRating=6');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /between 1 and 5/i);
    });

    it('should reject unsupported categories with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?categories=Electronics,AlienTech');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid category/i);
    });

    it('should reject unsupported sort options with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?sortBy=random_order');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid sort option/i);
    });

    it('should reject invalid page parameter (page=0) with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?page=0');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Page parameter must be a positive integer/i);
    });

    it('should reject limit exceeding bounds (limit=999) with 400 Bad Request', async () => {
      const res = await request(app).get('/api/products?limit=999');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Limit parameter must be an integer between 1 and 50/i);
    });
  });

  // 12. Single Product by ID
  describe('GET /api/products/:id', () => {
    it('should return single product for a valid ID', async () => {
      const all = await Product.find().limit(1);
      const targetId = all[0]._id.toString();

      const res = await request(app).get(`/api/products/${targetId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.product._id, targetId);
    });

    it('should return 404 Not Found for nonexistent ObjectId', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/products/${fakeId}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('should return 400 Bad Request for malformed ID', async () => {
      const res = await request(app).get('/api/products/invalid-id-format');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // 13. Fallback 404 Route
  describe('404 Route Not Found Handling', () => {
    it('should return 404 with structured JSON on unregistered routes', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Endpoint not found/i);
    });
  });
});
