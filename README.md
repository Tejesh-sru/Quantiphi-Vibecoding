# E-Commerce Product Multi-Filter System (MERN Stack)

A high-performance, responsive E-Commerce Product Multi-Filter application adhering to clean MVC architecture and strict software engineering principles.

---

## 🛠️ Technology Stack
* **Frontend:** React.js (Functional components & hooks), Axios
* **Backend:** Node.js & Express.js (MVC Architecture)
* **Database:** MongoDB with Mongoose
* **Testing:** Node.js Native Test Runner (`node:test`, `node:assert/strict`), Supertest
* **Styling:** Plain CSS with modern CSS variables, responsive Grid & Flexbox (No Tailwind CSS)

---

## 🏗️ Architecture & MVC Structure

```
Vibecoding/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handling
│   ├── controllers/
│   │   └── productController.js  # Controller: getProducts, getCategories, getProductById, getProductMeta
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized error handler & 404 middleware
│   │   └── validateQuery.js      # Query parameter validation & sanitization
│   ├── models/
│   │   └── Product.js            # Mongoose Product Schema & Compound Indexes
│   ├── routes/
│   │   └── productRoutes.js      # REST API route definitions
│   ├── seeds/
│   │   └── seedProducts.js       # Database seeder (35 realistic products)
│   ├── tests/
│   │   └── products.api.test.js  # 21 Integration & Unit API Tests (Supertest)
│   ├── app.js                    # Express app configuration & middleware pipeline
│   ├── server.js                 # Server listener & graceful process lifecycle
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/productApi.js     # Axios API client
│   │   ├── components/Filters/   # Dual slider, category checkboxes, rating radios, sort
│   │   ├── components/Products/  # Product cards, responsive grid, empty state
│   │   ├── hooks/useDebounce.js  # 300ms slider debounce hook
│   │   ├── tests/
│   │   │   └── filters.functional.test.js # 10 Frontend invariant & functional tests
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── run-tests.js                  # Automated test runner for full-stack test suite
└── README.md                     # Documentation & test reports
```

---

## 📡 REST API Endpoints

### 1. `GET /api/products`
Retrieves products filtered and sorted strictly on the backend.

#### Query Parameters:
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `categories` | String | No | Comma-separated categories | `Electronics,Apparel` |
| `minPrice` | Number | No | Minimum price (`price >= minPrice`) | `50` |
| `maxPrice` | Number | No | Maximum price (`price <= maxPrice`) | `500` |
| `minRating` | Number | No | Minimum rating (`rating >= minRating`, 1–5) | `4` |
| `sortBy` | String | No | Sort order: `price_asc`, `price_desc`, `rating_desc` | `price_asc` |

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "count": 12,
  "products": [
    {
      "_id": "673468...",
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "description": "Industry-leading noise cancellation...",
      "category": "Electronics",
      "price": 399.99,
      "rating": 4.8,
      "image": "https://images.unsplash.com/...",
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

### 2. `GET /api/products/categories`
Returns all 5 supported product categories (`Electronics`, `Apparel`, `Footwear`, `Home & Kitchen`, `Accessories`).

### 3. `GET /api/products/:id`
Returns a single product by its MongoDB `_id`.

### 4. `GET /api/products/meta`
Returns dynamic min/max catalog price bounds to dynamically calibrate the frontend dual-slider.

---

## 🚦 Error Handling & Validations
The API implements strict validations in `validateQuery.js`:
* **Negative Prices:** Returns `400 Bad Request` if `minPrice < 0` or `maxPrice < 0`.
* **Inverted Price Bounds:** Returns `400 Bad Request` if `minPrice > maxPrice`.
* **Invalid Rating:** Returns `400 Bad Request` if `minRating < 1` or `minRating > 5`.
* **Invalid Category:** Returns `400 Bad Request` if an unsupported category is queried.
* **Invalid Sort Option:** Returns `400 Bad Request` if unsupported sort criteria are provided.
* **Invalid Product ID:** Returns `400 Bad Request` on malformed ObjectId, or `404 Not Found` if nonexistent.

---

## 🧪 Automated Testing & QA Verification

The project includes **31 automated test cases** covering both backend REST API integration and frontend business logic invariants.

### Understanding Negative Testing (`400 Bad Request` and `404 Not Found`)
In production-grade software testing, **Negative Tests** intentionally send malformed or malicious data (e.g. `minPrice: -15` or an inverted price range) to verify that the server **safely rejects invalid requests** with the correct HTTP status code (`400` or `404`) instead of crashing (`500 Internal Server Error`). When a negative test receives the expected `400` or `404`, the test passes (`✔`).

### Test Suite Results

```
====================================================
   🚀 RUNNING FULL-STACK TEST SUITE (API & FUNCTIONAL)
====================================================

▶ Running Backend REST API Tests...
[MongoDB] Connected successfully to: localhost/ecommerce_filter_db
▶ E-Commerce Multi-Filter REST API Test Suite
  ▶ GET /api/health
    ✔ should return 200 OK and uptime timestamp (24.6189ms)
  ✔ GET /api/health (25.5382ms)
  ▶ GET /api/products/categories
    ✔ should return list of all 5 supported product categories (9.3367ms)
  ✔ GET /api/products/categories (9.6599ms)
  ▶ GET /api/products/meta
    ✔ should return catalog price bounds and total count (10.265ms)
  ✔ GET /api/products/meta (10.4769ms)
  ▶ GET /api/products (Default state)
    ✔ should return all products with success and count (16.6686ms)
  ✔ GET /api/products (Default state) (16.9223ms)
  ▶ Category Filtering
    ✔ should filter by a single category (Electronics) (15.8374ms)
    ✔ should filter by multiple categories using $in logic (Footwear, Apparel) (17.5347ms)
  ✔ Category Filtering (33.9039ms)
  ▶ Price Range Filtering
    ✔ should return products within minPrice and maxPrice inclusive (13.0515ms)
  ✔ Price Range Filtering (13.3298ms)
  ▶ Customer Star Rating Filtering
    ✔ should return products with rating >= minRating (11.1173ms)
  ✔ Customer Star Rating Filtering (11.3755ms)
  ▶ Combined Multi-Filter (AND Logic)
    ✔ should simultaneously respect Category, Price, and Rating constraints (11.8711ms)
  ✔ Combined Multi-Filter (AND Logic) (12.1215ms)
  ▶ Sorting Strategies
    ✔ should sort products by price ascending (price_asc) (15.3583ms)
    ✔ should sort products by price descending (price_desc) (10.7345ms)
    ✔ should sort products by top rated first (rating_desc) (9.1972ms)
  ✔ Sorting Strategies (35.6609ms)
  ▶ Input Validation & Error Edge Cases
    ✔ should reject negative minPrice with 400 Bad Request (7.8011ms)
    ✔ should reject when minPrice > maxPrice with 400 Bad Request (4.9569ms)
    ✔ should reject minRating > 5 with 400 Bad Request (5.0196ms)
    ✔ should reject unsupported categories with 400 Bad Request (7.1356ms)
    ✔ should reject unsupported sort options with 400 Bad Request (4.9806ms)
  ✔ Input Validation & Error Edge Cases (30.3834ms)
  ▶ GET /api/products/:id
    ✔ should return single product for a valid ID (12.2632ms)
    ✔ should return 404 Not Found for nonexistent ObjectId (6.2249ms)
    ✔ should return 400 Bad Request for malformed ID (8.9777ms)
  ✔ GET /api/products/:id (27.9516ms)
  ▶ 404 Route Not Found Handling
    ✔ should return 404 with structured JSON on unregistered routes (6.6249ms)
  ✔ 404 Route Not Found Handling (6.8789ms)
✔ E-Commerce Multi-Filter REST API Test Suite (299.4333ms)

ℹ tests 21
ℹ suites 13
ℹ pass 21
ℹ fail 0
ℹ duration_ms 1792.9712
✔ Backend REST API Tests passed successfully!

▶ Running Frontend Functional Tests...
▶ Frontend Filter Functional & Business Invariants Test Suite
  ▶ Dual Price Slider Logic
    ✔ should clamp minPrice so it NEVER exceeds maxPrice (1.7512ms)
    ✔ should clamp maxPrice so it NEVER falls below minPrice (0.2139ms)
    ✔ should accurately compute track highlight percentage coordinates (0.237ms)
  ✔ Dual Price Slider Logic (3.0784ms)
  ▶ Category Filter Multi-Selection Toggle
    ✔ should add category when not previously present (1.0649ms)
    ✔ should remove category when already selected (0.1995ms)
    ✔ should return empty list when all categories are deselected (0.1376ms)
  ✔ Category Filter Multi-Selection Toggle (1.6657ms)
  ▶ Rating Filter State Transitions
    ✔ should select minimum rating between 1 and 5 (0.1639ms)
    ✔ should reset rating filter to 0 on clear (0.1568ms)
  ✔ Rating Filter State Transitions (0.5429ms)
  ▶ API Query Parameter Serialization
    ✔ should generate valid query string for backend API (0.5146ms)
    ✔ should omit unset or default filter parameters (0.7267ms)
  ✔ API Query Parameter Serialization (1.6383ms)
✔ Frontend Filter Functional & Business Invariants Test Suite (7.6265ms)

ℹ tests 10
ℹ suites 5
ℹ pass 10
ℹ fail 0
ℹ duration_ms 127.3464
✔ Frontend Functional Tests passed successfully!

====================================================
🎉 ALL TESTS PASSED! (Completed in 2.16s)
====================================================
```

### Running Tests Locally
```bash
# Run both Backend API and Frontend Functional suites
node run-tests.js

# Or run backend test suite alone
cd backend
npm test
```

---

## 💻 Setup & Installation Instructions

### Prerequisites
* Node.js v18+
* MongoDB running locally (`mongodb://localhost:27017`) or a free MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables (create .env from .env.example)
cp .env.example .env

# Populate database with 35 realistic products across all categories
npm run seed

# Start backend server (runs on http://localhost:5000)
npm run dev
# or for production
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite React development server (runs on http://localhost:3000)
npm run dev
```
Open your browser at `http://localhost:3000`. The frontend automatically proxies `/api` calls to `http://localhost:5000`.
