# E-Commerce Product Multi-Filter System (MERN Stack)

A high-performance, responsive E-Commerce Product Multi-Filter application adhering to clean MVC architecture, robust server-driven querying, and comprehensive QA testing.

---

## 🛠️ Technology Stack
* **Frontend:** React.js 18 (Functional components & hooks), Axios
* **Backend:** Node.js & Express.js (MVC Architecture)
* **Database:** MongoDB with Mongoose
* **Testing:** Node.js Native Test Runner (`node:test`, `node:assert/strict`), Supertest
* **Styling:** Plain CSS with modern CSS variables, responsive Grid & Flexbox (No Tailwind CSS)

---

## 🚀 Core & Extended Features

1. **Backend Product Search by Name:**
   - Case-insensitive search on product names.
   - Escapes special characters to prevent regex injection (ReDoS).
   - Partial match support (e.g. searching "headphone" matches "Sony WH-1000XM5 Wireless Noise-Canceling Headphones").

2. **Server-Side Pagination:**
   - Query parameters: `page` (default `1`) and `limit` (default `8`, max `50`).
   - Slices database records using `.skip((page - 1) * limit).limit(limit)`.

3. **Total Matching Products & Total Pages:**
   - Returns `{ total, totalPages, page, limit, count, products }`.
   - UI summary: *"Showing 1–8 of 35 products (Page 1 of 5)"*.

4. **Multi-Category Filtering:**
   - `Electronics`, `Apparel`, `Footwear`, `Home & Kitchen`, `Accessories`.
   - Multi-select checkbox options with query `$in` evaluation.

5. **Dual-Range Price Slider:**
   - Boundary invariant clamping: `minPrice <= maxPrice` at all times.
   - Visual active range highlight track.
   - 300ms debounce to prevent excessive server requests during dragging.

6. **Customer Star Rating Filtering:**
   - 1 to 5-star radio button selector (`rating >= minRating`).

7. **Server-Driven Sorting:**
   - *Price: Low to High* (`price_asc`)
   - *Price: High to Low* (`price_desc`)
   - *Top Rated First* (`rating_desc`)

8. **Active Filter Chips & Individual Removal:**
   - Chips generated for active Search query, Category selections, Price range, and Star rating.
   - Clicking `×` on any individual chip resets only that specific filter and resets pagination back to page 1.

9. **Clear All Filters Functionality:**
   - A single-click "Clear All" action in both the sidebar and chips row resets search, categories, price range, rating, and sort back to defaults.

10. **Loading Skeletons:**
    - High-fidelity animated shimmer placeholder cards displayed during data fetching.

11. **Strict Processing Order:**
    ```
    Incoming Request
          │
          ▼
    1. SEARCH        -> filterConditions.name = { $regex: sanitized, $options: 'i' }
          │
          ▼
    2. FILTERING     -> category ($in), price ($gte, $lte), rating ($gte)
          │
          ▼
    3. SORTING       -> price_asc, price_desc, rating_desc
          │
          ▼
    4. PAGINATION    -> .skip((page - 1) * limit).limit(limit)
    ```

12. **Database Performance Indexing:**
    - Compound index: `{ category: 1, price: 1, rating: -1 }`
    - Sorting indexes: `{ price: 1 }`, `{ rating: -1 }`
    - Search text & B-tree indexes: `{ name: 'text', description: 'text' }`, `{ name: 1 }`, `{ name: 1, category: 1, price: 1 }`

---

## 🏗️ Architecture & File Structure

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
│   │   └── products.api.test.js  # 27 Integration & Unit API Tests (Supertest)
│   ├── app.js                    # Express app configuration & middleware pipeline
│   ├── server.js                 # Server listener & graceful process lifecycle
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/productApi.js     # Axios API client
│   │   ├── components/Common/    # SearchBar, Pagination, StarRating
│   │   ├── components/Filters/   # Dual slider, category checkboxes, rating radios, sort
│   │   ├── components/Products/  # Product cards, responsive grid, empty state
│   │   ├── hooks/useDebounce.js  # 300ms debounce hook
│   │   ├── tests/
│   │   │   └── filters.functional.test.js # 14 Frontend invariant & functional tests
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
Retrieves products filtered, searched, sorted, and paginated strictly on the backend.

#### Query Parameters:
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search` | String | No | Search keyword in product name | `wireless` |
| `categories` | String | No | Comma-separated categories | `Electronics,Apparel` |
| `minPrice` | Number | No | Minimum price (`price >= minPrice`) | `50` |
| `maxPrice` | Number | No | Maximum price (`price <= maxPrice`) | `500` |
| `minRating` | Number | No | Minimum rating (`rating >= minRating`, 1–5) | `4` |
| `sortBy` | String | No | Sort order: `price_asc`, `price_desc`, `rating_desc` | `price_asc` |
| `page` | Integer | No | Page number (default: `1`) | `2` |
| `limit` | Integer | No | Items per page (default: `8`, max: `50`) | `8` |

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "count": 8,
  "total": 35,
  "page": 1,
  "totalPages": 5,
  "limit": 8,
  "products": [
    {
      "_id": "673468...",
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "description": "Industry-leading noise cancellation...",
      "category": "Electronics",
      "price": 399.99,
      "rating": 4.8,
      "image": "https://images.unsplash.com/...",
      "imageUrl": "https://images.unsplash.com/...",
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

### 2. `GET /api/products/categories`
Returns all 5 supported product categories.

### 3. `GET /api/products/:id`
Returns a single product by its MongoDB `_id`.

### 4. `GET /api/products/meta`
Returns dynamic min/max catalog price bounds to dynamically calibrate the frontend dual-slider.

---

## 🧪 Automated Testing & QA Verification

The project includes **41 automated test cases** covering backend REST API integration and frontend functional invariants.

```
====================================================
   🚀 RUNNING FULL-STACK TEST SUITE (API & FUNCTIONAL)
====================================================

▶ Running Backend REST API Tests...
✔ E-Commerce Multi-Filter REST API Test Suite (318ms)
ℹ tests 27 | pass 27 | fail 0
✔ Backend REST API Tests passed successfully!

▶ Running Frontend Functional Tests...
✔ Frontend Filter Functional & Business Invariants Test Suite (7.8ms)
ℹ tests 14 | pass 14 | fail 0
✔ Frontend Functional Tests passed successfully!

====================================================
🎉 ALL 41 TESTS PASSED! (Completed in 2.12s)
====================================================
```

### Running Tests Locally
```bash
# Run full suite (Backend API & Frontend Functional)
node run-tests.js
```

---

## 🎓 Technical Viva Q&A Guide

### Q1: Why must filtering and pagination happen on the backend instead of React?
**Answer:**
If the database contains 100,000 products, sending all 100,000 items over the network to the browser consumes hundreds of megabytes of bandwidth, exhausts mobile device memory, and degrades performance. By applying Search $\rightarrow$ Filtering $\rightarrow$ Sorting $\rightarrow$ Pagination directly in MongoDB via indexed queries, the database returns only the requested page (e.g. 8 items) in milliseconds, keeping the client lightweight and scalable.

### Q2: What is the exact execution order and why does it matter?
**Answer:**
1. **Search & Filter:** Reduces the entire collection down to only matching records.
2. **Sort:** Orders the reduced set according to user criteria (`price_asc`, `price_desc`, `rating_desc`).
3. **Pagination:** `countDocuments()` computes the total matching records for the UI page count, and `.skip((page - 1) * limit).limit(limit)` retrieves the exact page slice.
*If pagination occurred before filtering, a user would only filter items within the current page, missing relevant products on other pages.*

### Q3: Why do we test for `400 Bad Request` and `404 Not Found` in the test suite?
**Answer:**
This is called **Negative Testing**. It proves that the application is resilient against malformed inputs (e.g., negative prices, minPrice > maxPrice, invalid ratings, or fake categories) and responds with clear HTTP 400 errors rather than crashing with 500 Internal Server Errors.

### Q4: How do database indexes improve search and filter performance?
**Answer:**
Without indexes, MongoDB performs a **COLLSCAN** (full collection scan), examining every single document ($O(N)$). With compound indexes on `{ category: 1, price: 1, rating: -1 }` and text/prefix indexes on `{ name: 1 }`, MongoDB performs an **IXSCAN** ($O(\log N)$ B-tree traversal), instantly locating qualifying documents.

### Q5: Why is debouncing necessary on the search bar and price slider?
**Answer:**
When a user drags a range slider or types into a search bar, dozens of events fire per second. Without debouncing, each keystroke or millimeter of drag dispatches an HTTP request, flooding the server. A 300ms debounce pauses execution until the user stops interacting, firing only one optimized request.

---

## 💻 Setup & Installation Instructions

### Prerequisites
* Node.js v18+
* MongoDB running locally (`mongodb://localhost:27017`) or a free MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.
