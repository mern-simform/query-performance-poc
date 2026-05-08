import express from 'express';
import { pool }  from '../db/postgres.js';
import { redis } from '../db/redis.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const start    = Date.now();
  const cacheKey = 'dashboard:summary';

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({
      _debug: { source: 'redis_cache', total_ms: Date.now() - start },
      data: JSON.parse(cached),
    });
  }

  // Only the columns the client actually renders
  const users = await pool.query(
    'SELECT id, name, email FROM users LIMIT 100'
  );
  const userIds = users.rows.map(u => u.id);

  // Two independent queries — run in parallel
  const [ordersResult, limitsResult] = await Promise.all([
    pool.query(
      `SELECT user_id, id, status, amount
         FROM orders
        WHERE user_id = ANY($1)`,
      [userIds]
    ),
    pool.query(
      `SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_spent
         FROM orders
        WHERE user_id = ANY($1)
        GROUP BY user_id`,
      [userIds]
    ),
  ]);

  // Group in memory — no extra round trips
  const orderMap = {};
  for (const o of ordersResult.rows) {
    (orderMap[o.user_id] ||= []).push(o);
  }

  const limitMap = {};
  for (const l of limitsResult.rows) {
    limitMap[l.user_id] = l;
  }

  const result = users.rows.map(u => ({
    ...u,
    orders:      orderMap[u.id] || [],
    order_count: limitMap[u.id]?.order_count || 0,
    total_spent: limitMap[u.id]?.total_spent || 0,
  }));

  // Cache for 60 seconds
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

  const totalMs = Date.now() - start;

  res.json({
    _debug: {
      source:      'database',
      total_ms:    totalMs,
      query_count: 3,   // users + orders batch + aggregates (all parallel)
    },
    data: result,
  });
});

export default router;
