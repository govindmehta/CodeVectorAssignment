import pg from "pg";
import dotenv from "dotenv";
import { getProducts } from "./controllers/productController.js"; // We'll adapt our logic to simulate a request

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

// A mini-mock of Express req/res to run our controller logic directly
async function simulateApiCall(queryParams) {
  let queryText = `SELECT id, name, category, price, created_at FROM products`;
  let queryParamsArray = [];
  let whereClauses = [];

  if (queryParams.category) {
    queryParamsArray.push(queryParams.category);
    whereClauses.push(`category = $${queryParamsArray.length}`);
  }

  if (queryParams.nextCursorTimestamp && queryParams.nextCursorId) {
    queryParamsArray.push(
      queryParams.nextCursorTimestamp,
      queryParams.nextCursorId,
    );
    whereClauses.push(
      `(created_at < $${queryParamsArray.length - 1} OR (created_at = $${queryParamsArray.length - 1} AND id < $${queryParamsArray.length}))`,
    );
  }

  if (whereClauses.length > 0) {
    queryText += ` WHERE ` + whereClauses.join(" AND ");
  }

  queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${queryParamsArray.length + 1}`;
  queryParamsArray.push(queryParams.limit || 20);

  const { rows } = await pool.query(queryText, queryParamsArray);

  return {
    products: rows,
    nextCursor:
      rows.length === (queryParams.limit || 20)
        ? {
            timestamp: rows[rows.length - 1].created_at,
            id: rows[rows.length - 1].id,
          }
        : null,
  };
}

async function runIntegrityTest() {
  console.log("--- STARTING DATA INTEGRITY AND SLIDE TEST ---");
  const targetCategory = "Electronics";

  try {
    // 1. Fetch Page 1
    console.log("\nStep 1: User fetches Page 1 (First 5 items)...");
    const page1 = await simulateApiCall({ category: targetCategory, limit: 5 });

    console.log(
      "Page 1 Product IDs loaded:",
      page1.products.map((p) => p.id),
    );
    const lastItemPage1 = page1.products[page1.products.length - 1];
    console.log(
      `Last item on Page 1: ID=${lastItemPage1.id}, Name="${lastItemPage1.name}"`,
    );

    // 2. Simulate Concurrent Writes (5 new items dropping in)
    console.log(
      "\nStep 2: Simulating 5 NEW products added to the database concurrently...",
    );
    const injectQuery = `
      INSERT INTO products (name, category, price, created_at, updated_at)
      SELECT 
        'CONCURRENT NEW ITEM #' || i, 
        $1, 
        299.99, 
        NOW() + (i || ' seconds')::interval, -- Newest timestamps
        NOW() + (i || ' seconds')::interval
      FROM generate_series(1, 5) AS i
      RETURNING id;
    `;
    const insertedItems = await pool.query(injectQuery, [targetCategory]);
    console.log(
      `Successfully injected ${insertedItems.rowCount} newer records into the database.`,
    );

    // 3. Fetch Page 2 using Keyset Cursor
    console.log(
      '\nStep 3: User clicks "Load More" to fetch Page 2 using the cursor...',
    );
    const page2 = await simulateApiCall({
      category: targetCategory,
      limit: 5,
      nextCursorTimestamp: lastItemPage1.timestamp,
      nextCursorId: lastItemPage1.id,
    });

    console.log(
      "Page 2 Product IDs loaded:",
      page2.products.map((p) => p.id),
    );

    // 4. Verify Integrity Assumptions
    console.log("\nStep 4: Analyzing results for anomalies...");

    // Check for duplicates
    const page1Ids = page1.products.map((p) => p.id);
    const page2Ids = page2.products.map((p) => p.id);
    const duplicates = page2Ids.filter((id) => page1Ids.includes(id));

    // Check if any injected items slipped into page 2
    const injectedIds = insertedItems.rows.map((r) => r.id);
    const slippedInjectedItems = page2Ids.filter((id) =>
      injectedIds.includes(id),
    );

    if (duplicates.length === 0) {
      console.log(
        "✅ PASS: Zero duplicate items encountered across page boundaries!",
      );
    } else {
      console.log("❌ FAIL: Duplicate items found:", duplicates);
    }

    if (slippedInjectedItems.length === 0) {
      console.log(
        "✅ PASS: Newly injected items did not displace or corrupt historical pagination windows!",
      );
    } else {
      console.log(
        "❌ FAIL: New items incorrectly broke into historical pagination stream:",
        slippedInjectedItems,
      );
    }
  } catch (error) {
    console.error("Test script failed with error:", error);
  } finally {
    await pool.end();
  }
}

runIntegrityTest();
