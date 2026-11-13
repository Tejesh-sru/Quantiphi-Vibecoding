# E-Commerce Product Multi-Filter System (MERN Stack)

A high-performance, responsive E-Commerce Product Multi-Filter application adhering to clean MVC architecture and strict software engineering principles.

---

## 🛠️ Technology Stack
* **Frontend:** React.js (Functional components & hooks), Axios
* **Backend:** Node.js & Express.js (MVC Architecture)
* **Database:** MongoDB with Mongoose
* **Styling:** Plain CSS with modern CSS variables, responsive Grid & Flexbox (No Tailwind CSS)

---

## 🏗️ Architecture & MVC Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection handling
├── controllers/
│   └── productController.js  # Controller: getProducts, getCategories, getProductById, getProductMeta
├── middleware/
│   ├── errorHandler.js       # Centralized error handler & 404 middleware
│   └── validateQuery.js      # Query parameter validation & sanitization
├── models/
│   └── Product.js            # Mongoose Product Schema & Compound Indexes
├── routes/
│   └── productRoutes.js      # REST API route definitions
├── seeds/
│   └── seedProducts.js       # Database seeder (35 realistic products)
├── .env.example
├── package.json
└── server.js                 # Express server entrypoint
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
Returns all supported product categories.

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
