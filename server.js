import express    from 'express';
import 'dotenv/config';

import dashboardBad  from './routes/dashboard-bad.js';
import dashboardGood from './routes/dashboard-good.js';
import ordersBad     from './routes/orders-bad.js';
import ordersGood    from './routes/orders-good.js';

const app  = express();
const PORT = 3000;

app.use(express.json());

// Problem 1 — PostgreSQL
app.use('/api/dashboard/bad',  dashboardBad);
app.use('/api/dashboard/good', dashboardGood);

// Problem 2 — MongoDB
app.use('/api/orders/bad',  ordersBad);
app.use('/api/orders/good', ordersGood);

app.listen(PORT, () => {
  console.log(`Demo server running on http://localhost:${PORT}`);
});
