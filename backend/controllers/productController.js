import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { category, nextCursorTimestamp, nextCursorId } = req.query;

    let queryText = `SELECT id, name, category, price, created_at FROM products`;
    let queryParams = [];
    let whereClauses = [];

    if (category) {
      queryParams.push(category);
      whereClauses.push(`category = $${queryParams.length}`);
    }

    if (nextCursorTimestamp && nextCursorId) {
      queryParams.push(nextCursorTimestamp, nextCursorId);
      const tsParam = `$${queryParams.length - 1}`;
      const idParam = `$${queryParams.length}`;
      whereClauses.push(`(created_at < ${tsParam} OR (created_at = ${tsParam} AND id < ${idParam}))`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ` + whereClauses.join(' AND ');
    }

    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const startTime = Date.now();
    const { rows } = await pool.query(queryText, queryParams);
    const executionTimeMs = Date.now() - startTime;

    let hasMore = false;
    let nextCursor = null;

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
    console.error('Database query error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};