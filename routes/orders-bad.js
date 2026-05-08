import express from 'express';
import { Order } from '../db/mongo.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const start = Date.now();

  const results = await Order.aggregate([
    {
      $lookup: {
        from:         'users',
        localField:   'userId',
        foreignField: '_id',
        as:           'user',
      },
    },
    {
      $match: {
        status:    'active',
        createdAt: { $gte: new Date('2024-01-01') },
      },
    },
    {
      $project: {
        _id: 1, amount: 1, status: 1, createdAt: 1,
      },
    },
  ]);

  res.json({
    _debug: {
      total_ms:  Date.now() - start,
      returned:  results.length,
      note:      '$lookup before $match = full collection scan first',
    },
    data: results.slice(0, 20),
  });
});

export default router;
