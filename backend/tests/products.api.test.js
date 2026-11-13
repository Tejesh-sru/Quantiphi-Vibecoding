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
    // Ensure database connection and seeded state
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(realisticProducts);
    }
  });

  after(async () => {
    // Gracefully close database connection after test run completes
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

  // 4. Default Products Query
  describe('GET /api/products (Default state)', () => {
    it('should return all products with success and count', async () => {
      const res = await request(app).get('/api/products');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.count > 0);
      assert.ok(Array.isArray(res.body.products));
      assert.equal(res.body.products.length, res.body.count);

      // Verify product schema contracts
      const sample = res.body.products[0];
      assert.ok(sample._id);
      assert.ok(sample.name);
      assert.ok(sample.category);
      assert.ok(sample.price !== undefined);
      assert.ok(sample.rating !== undefined);
      assert.ok(sample.image);
    });
  });

  // 5. Category Filtering
  describe('Category Filtering', () => {
    it('should filter by a single category (Electronics)', async () => {
      const res = await request(app).get('/api/products?categories=Electronics');
      assert.equal(res.status, 200);
      assert.ok(res.body.count > 0);
      res.body.products.forEach((p) => {
        assert.equal(p.category, 'Electronics');
      });
    });

    it('should filter by multiple categories using $in logic (Footwear, Apparel)', async () => {
      const res = await request(app).get('/api/products?categories=Footwear,Apparel');
      assert.equal(res.status, 200);
      assert.ok(res.body.count > 0);
      res.body.products.forEach((p) => {
        assert.ok(['Footwear', 'Apparel'].includes(p.category));
      });
    });
  });

  // 6. Price Range Filtering
  describe('Price Range Filtering', () => {
    it('should return products within minPrice and maxPrice inclusive', async () => {
      const min = 50;
      const max = 200;
      const res = await request(app).get(`/api/products?minPrice=${min}&maxPrice=${max}`);
      assert.equal(res.status, 200);
      res.body.products.forEach((p) => {
        assert.ok(p.price >= min, `Product price ${p.price} should be >= ${min}`);
        assert.ok(p.price <= max, `Product price ${p.price} should be <= ${max}`);
      });
    });
  });

  // 7. Star Rating Filtering
  describe('Customer Star Rating Filtering', () => {
    it('should return products with rating >= minRating', async () => {
      const minRating = 4;
      const res = await request(app).get(`/api/products?minRating=${minRating}`);
      assert.equal(res.status, 200);
      assert.ok(res.body.count > 0);
      res.body.products.forEach((p) => {
        assert.ok(p.rating >= minRating, `Product rating ${p.rating} should be >= ${minRating}`);
      });
    });
  });

  // 8. Multi-Filter Combination (AND Logic)
  describe('Combined Multi-Filter (AND Logic)', () => {
    it('should simultaneously respect Category, Price, and Rating constraints', async () => {
      const url = '/api/products?categories=Electronics&minPrice=100&maxPrice=500&minRating=4';
      const res = await request(app).get(url);
      assert.equal(res.status, 200);
      res.body.products.forEach((p) => {
        assert.equal(p.category, 'Electronics');
        assert.ok(p.price >= 100 && p.price <= 500);
        assert.ok(p.rating >= 4);
      });
    });
  });

  // 9. Sorting Logic (Happens AFTER filtering)
  describe('Sorting Strategies', () => {
    it('should sort products by price ascending (price_asc)', async () => {
      const res = await request(app).get('/api/products?sortBy=price_asc');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].price <= items[i + 1].price, `Price at ${i} should be <= ${i + 1}`);
      }
    });

    it('should sort products by price descending (price_desc)', async () => {
      const res = await request(app).get('/api/products?sortBy=price_desc');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].price >= items[i + 1].price, `Price at ${i} should be >= ${i + 1}`);
      }
    });

    it('should sort products by top rated first (rating_desc)', async () => {
      const res = await request(app).get('/api/products?sortBy=rating_desc');
      assert.equal(res.status, 200);
      const items = res.body.products;
      for (let i = 0; i < items.length - 1; i++) {
        assert.ok(items[i].rating >= items[i + 1].rating, `Rating at ${i} should be >= ${i + 1}`);
      }
    });
  });

  // 10. Query Validation & Edge Case Handling
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
  });

  // 11. Single Product by ID
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

  // 12. Fallback 404 Route
  describe('404 Route Not Found Handling', () => {
    it('should return 404 with structured JSON on unregistered routes', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Endpoint not found/i);
    });
  });
});
