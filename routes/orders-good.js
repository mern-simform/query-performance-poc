import express from 'express';
import { Order } from '../db/mongo.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const start = Date.now();

  const results = await Order.aggregate([
    {
      $match: {
        status:    'active',
        createdAt: { $gte: new Date('2024-01-01') },
      },
    },
    {
      $project: {
        userId: 1, amount: 1, status: 1, createdAt: 1,
      },
    },
    // $lookup only on the filtered + trimmed set
    {
      $lookup: {
        from:         'users',
        localField:   'userId',
        foreignField: '_id',
        as:           'user',
      },
    },
  ]);

  res.json({
    _debug: {
      total_ms: Date.now() - start,
      returned: results.length,
      note:     '$match first + projection before $lookup',
    },
    data: results.slice(0, 20),
  });
});

export default router;
