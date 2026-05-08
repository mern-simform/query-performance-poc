import express from 'express';
import { pool } from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const start = Date.now();

  // Fetch 100 users — no column selection
  const users = await pool.query('SELECT * FROM users LIMIT 100');
  const queryCount = { value: 1 };

  // N+1: one extra query per user
  for (const user of users.rows) {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [user.id]
    );
    user.orders = orders.rows;
    queryCount.value++;
  }

  const totalMs = Date.now() - start;

  res.json({
    _debug: {
      total_ms:    totalMs,
      query_count: queryCount.value,   // should be 101
      note:        'One query per user — classic N+1',
    },
    data: users.rows,
  });
});

export default router;
