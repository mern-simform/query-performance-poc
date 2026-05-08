EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT user_id, id, status, amount
FROM orders
WHERE user_id = ANY(ARRAY[1,2,3,4,5]);
