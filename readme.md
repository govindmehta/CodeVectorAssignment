# CodeVector Catalog — High-Performance Pagination Engine

A production-grade full-stack product catalog designed to browse ~200,000 products seamlessly. Built with Node.js, React, and Neon (PostgreSQL), this system is explicitly optimized for speed (**O(log N)** query lookups) and total data integrity during concurrent writes.

---

## 🚀 Key Architectural Highlights

### 1. Keyset (Cursor-Based) Pagination vs. Offset Pagination

Traditional pagination (`LIMIT 20 OFFSET 10000`) forces the database to scan and discard thousands of rows sequentially, degrading performance. Furthermore, if items are injected or updated concurrently while a user is browsing, offset pagination shifts the underlying dataset—causing users to see the same products twice or skip rows entirely.

This system utilizes **Keyset (Cursor-Based) Pagination**.

The frontend tracks the strict chronological checkpoint (`created_at` timestamp and unique fallback `id`) of the last item visible on the screen. The backend then seeks strictly older records using a deterministic conditional match:

```sql
WHERE (
    created_at < $cursor_time
    OR (
        created_at = $cursor_time
        AND id < $cursor_id
    )
)
```

This isolates the user's historical browsing window from live data noise. Concurrent insertions sit safely at the top of the feed and cleanly catch up when the user explicitly refreshes or resets their filter.

---

### 2. High-Performance Composite Indexing

To reduce database scanning down to less than 10ms across 200,000 rows, the system applies specialized composite B-Tree indexes matching retrieval patterns exactly:

#### Global Browsing Optimization

```sql
CREATE INDEX idx_products_created_id
ON products (created_at DESC, id DESC);
```

#### Category Filtering Optimization

```sql
CREATE INDEX idx_products_category_created_id
ON products (category, created_at DESC, id DESC);
```

---

### 3. Instant Mass Seeding

Instead of running standard loops that make 200,000 individual network requests, the seeding infrastructure utilizes a native, vectorized SQL script leveraging PostgreSQL's `generate_series()` function and array casting to batch-insert the entire dataset in a single operation.

---

## 🛠️ Project Structure

```text
codevector-task/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection pool with SSL enforcement
│   ├── controllers/           # Business logic for cursor-seeking queries
│   ├── routes/                # API route definitions & test endpoints
│   ├── index.js               # Application entry point
│   ├── seed.js                # Native 200k-row generator
│   └── test-pagination.js     # Automated data-integrity validation
│
└── frontend/
    ├── src/
    │   ├── components/        # Presentational grid & stats components
    │   ├── services/          # API abstraction layer
    │   └── App.jsx            # Main state orchestrator
```

---

## ⚙️ Local Setup Instructions

### Prerequisites

* Node.js v18+
* Neon PostgreSQL or Supabase PostgreSQL database

---

### 1. Database Setup & Seeding

Create a `.env` file inside the backend directory:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb
```

Install dependencies and generate the dataset:

```bash
cd backend
npm install
npm run seed
```

This creates approximately **200,000 product records** optimized for pagination testing.

---

### 2. Run the Automated Data Integrity Test

Validate that concurrent modifications do not corrupt pagination boundaries:

```bash
npm run test:pagination
```

The test simulates concurrent inserts while users paginate through the dataset and verifies:

* No duplicate records
* No skipped records
* Stable cursor boundaries

---

### 3. Start the Applications

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL:

```text
http://localhost:5173
```

---

## 🧪 Validating Task Requirements on the UI

### Fast Pagination Check

1. Toggle product categories.
2. Click **Load More Products** repeatedly.
3. Observe the **DB Query Speed** indicator.

Queries consistently resolve within single-digit milliseconds due to optimized indexing and cursor-based retrieval.

---

### Data-Change Consistency Check

1. Filter by a category (for example, **Electronics**).
2. Scroll near the bottom and note the last product ID.
3. Click:

```text
⚠️ Simulate 50 Concurrent New Items
```

4. The application immediately inserts 50 new products with current timestamps.
5. Click **Load More Products**.

Expected behavior:

* Historical records continue loading from the previous cursor.
* No duplicates appear.
* No records are skipped.

6. Refresh the page.

Expected behavior:

* The newly inserted records now appear at the top of the catalog as the newest arrivals.

---

## 📈 Performance Characteristics

| Feature                   | Result                    |
| ------------------------- | ------------------------- |
| Dataset Size              | ~200,000 Products         |
| Pagination Strategy       | Keyset / Cursor-Based     |
| Query Complexity          | O(log N)                  |
| Duplicate Prevention      | ✅                         |
| Missing Record Prevention | ✅                         |
| Concurrent Write Safety   | ✅                         |
| Indexed Filtering         | ✅                         |
| Query Latency             | Single-Digit Milliseconds |

---

## 🔥 Why Cursor Pagination?

Offset pagination becomes increasingly expensive as datasets grow:

```sql
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;
```

The database must traverse and discard 100,000 rows before returning results.

Cursor pagination instead performs an index seek:

```sql
SELECT *
FROM products
WHERE (
    created_at < $cursor_time
    OR (
        created_at = $cursor_time
        AND id < $cursor_id
    )
)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

This maintains predictable performance regardless of dataset size while guaranteeing stable pagination under concurrent writes.

---

## 🏗️ Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* Neon Database
* Native SQL

### Frontend

* React
* Vite
* Modern JavaScript (ES6+)

### Database Optimization

* Composite B-Tree Indexes
* Keyset Pagination
* Native Bulk Seeding
* Query Plan Optimization

---

## 📄 License

This project is intended for technical assessment and educational purposes.

---

### Future Enhancements

* Infinite scrolling with Intersection Observer
* Redis caching layer
* Full-text search
* Product sorting options
* Horizontal database partitioning
* Real-time updates via WebSockets
* Docker deployment support
