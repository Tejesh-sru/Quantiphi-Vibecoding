# E-Commerce Product Multi-Filter System (MERN Stack)

A high-performance, responsive E-Commerce Product Multi-Filter Sidebar application built for a technical assessment adhering to full-stack software architecture principles.

---

## 🛠️ Technology Stack
* **Frontend:** React.js (Functional components & hooks), Axios
* **Styling:** Plain CSS with modern CSS variables, responsive Grid & Flexbox (No Tailwind CSS)
* **Backend:** Node.js & Express.js *(in progress / planned)*
* **Database:** MongoDB with Mongoose *(in progress / planned)*

---

## 🚀 Core Features & Implementation Details

1. **Multi-Category Filtering:**
   - Supported categories: `Electronics`, `Apparel`, `Footwear`, `Home & Kitchen`, `Accessories`.
   - Multi-select checkbox options with instant UI badge counter and query serialisation.

2. **Dual-Range Price Slider:**
   - Visual dual-range slider with dynamic track highlighting.
   - Enforces mathematical boundary invariants:
     - `minPrice` can never exceed `maxPrice`.
     - `maxPrice` can never fall below `minPrice`.
   - 300ms debounce on slider updates to prevent server flooding.

3. **Customer Star Rating Filtering:**
   - 1 to 5-star radio button selector.
   - Displays all products whose rating $\ge$ selected threshold.
   - Quick "All Ratings" reset toggle.

4. **Server-Driven Sorting:**
   - *Top Rated First* (`rating_desc`)
   - *Price: Low to High* (`price_asc`)
   - *Price: High to Low* (`price_desc`)

5. **Product Cards & Presentation:**
   - Responsive cards with product image, category badge, product title, USD price, and full/half/empty star ratings.
   - Skeleton loading states during asynchronous API updates.

6. **Empty State:**
   - Displays *"No items match your criteria"* when no products match.
   - Includes a prominent *"Reset Filters"* button.

7. **Architectural Decoupling:**
   - All filtering, sorting, and business logic are delegated to the backend API (`/api/products`).
   - Frontend utilizes `AbortController` to cancel stale in-flight requests on rapid filter changes.

---

## 📦 Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:3000` with an automatic proxy forwarding `/api` calls to `http://localhost:5000`.
