import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { category, nextCursorTimestamp, nextCursorId } = req.query;

    let queryText = `SELECT id, name, category, price, created_at FROM products`;
    let queryParams = [];
    let whereClauses = [];

    // 1. Handle category filtering explicitly
    if (category) {
      queryParams.push(category);
      whereClauses.push(`category = $${queryParams.length}`);
    }

    // 2. Handle Cursor Condition precisely with explicit parameter assignments
    if (nextCursorTimestamp && nextCursorId) {
      // Push variables to array sequentially
      queryParams.push(nextCursorTimestamp);
      const tsParamIndex = queryParams.length; // e.g., $1 or $2
      
      queryParams.push(parseInt(nextCursorId));
      const idParamIndex = queryParams.length; // e.g., $2 or $3

      // Strict seek down logic matching our B-Tree composite index
      whereClauses.push(`
        (created_at < $${tsParamIndex} OR (created_at = $${tsParamIndex} AND id < $${idParamIndex}))
      `);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ` + whereClauses.join(' AND ');
    }

    // Sort matching the index precisely
    queryParams.push(limit);
    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${queryParams.length}`;

    const startTime = Date.now();
    const { rows } = await pool.query(queryText, queryParams);
    const executionTimeMs = Date.now() - startTime;

    let nextCursor = null;
    let hasMore = false;

    if (rows.length === limit) {
      const lastItem = rows[rows.length - 1];
      nextCursor = {
        timestamp: lastItem.created_at,
        id: lastItem.id
      };
      hasMore = true;
    }

    res.json({
      success: true,
      executionTimeMs: `${executionTimeMs}ms`,
      count: rows.length,
      nextCursor,
      hasMore,
      products: rows
    });

  } catch (error) {
    console.error('Database query failure:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};