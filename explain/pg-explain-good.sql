-- Step 1: Add composite index
CREATE INDEX idx_orders_user_status_created
  ON orders(user_id, status, created_at DESC);

-- Step 2: Add covering index (avoids heap fetch for this query shape)
CREATE INDEX idx_orders_covering
  ON orders(user_id, status, created_at DESC)
  INCLUDE (amount, customer_id);

-- Step 3: Re-run the same explain
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT user_id, id, status, amount
FROM orders
WHERE user_id = ANY(ARRAY[1,2,3,4,5]);

