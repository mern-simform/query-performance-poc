import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

console.log('Dropping index idx_status_createdAt...');
await db.collection('orders').dropIndex('idx_status_createdAt');
console.log('Index dropped. You can now re-run mongo-explain.js cleanly.');

await mongoose.disconnect();
