import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

const UserSchema  = new mongoose.Schema({ name: String, email: String });
const OrderSchema = new mongoose.Schema({
  userId:    mongoose.Schema.Types.ObjectId,
  status:    String,
  amount:    Number,
  createdAt: Date,
  items:     [{ name: String, qty: Number, price: Number }],
  meta:      mongoose.Schema.Types.Mixed,
});

const User  = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

await User.deleteMany({});
await Order.deleteMany({});

// Seed 200 users
const users = await User.insertMany(
  Array.from({ length: 200 }, (_, i) => ({
    name:  `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }))
);

// Seed 200,000 orders (simulates growth to large dataset)
const BATCH    = 2000;
const TOTAL    = 200_000;
const statuses = ['active', 'inactive', 'pending', 'cancelled'];

for (let i = 0; i < TOTAL / BATCH; i++) {
  const docs = Array.from({ length: BATCH }, () => {
    const user   = users[Math.floor(Math.random() * users.length)];
    const months = Math.floor(Math.random() * 24);
    return {
      userId:    user._id,
      status:    statuses[Math.floor(Math.random() * statuses.length)],
      amount:    parseFloat((Math.random() * 1000).toFixed(2)),
      createdAt: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
      items:     [{ name: 'Item A', qty: 1, price: 99 }],
      // Large meta field — shows cost of fetching full documents without projection
      meta:      { tags: ['x', 'y', 'z'], notes: 'Some long notes field here '.repeat(10) },
    };
  });
  await Order.insertMany(docs);
  console.log(`Seeded batch ${i + 1}/${TOTAL / BATCH}`);
}

await mongoose.disconnect();
console.log('Mongo seed complete');
