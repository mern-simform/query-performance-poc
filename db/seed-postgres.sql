-- Create database (run once outside the script)
-- CREATE DATABASE session_demo;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id),
  status      TEXT NOT NULL DEFAULT 'active',
  amount      NUMERIC(10,2),
  customer_id INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 500 users
INSERT INTO users (name, email)
SELECT
  'User ' || i,
  'user' || i || '@example.com'
FROM generate_series(1, 500) AS i;

-- Seed 500,000 orders spread across users
-- Mix of active/inactive to simulate real distribution
INSERT INTO orders (user_id, status, amount, customer_id, created_at)
SELECT
  (random() * 499 + 1)::INT,
  CASE WHEN random() > 0.3 THEN 'active' ELSE 'inactive' END,
  (random() * 1000)::NUMERIC(10,2),
  (random() * 999)::INT,
  NOW() - (random() * INTERVAL '2 years')
FROM generate_series(1, 500000);
