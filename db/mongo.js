import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

export const OrderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:    String,
  amount:    Number,
  createdAt: Date,
  items:     [{ name: String, qty: Number, price: Number }],
  meta:      mongoose.Schema.Types.Mixed,
});

export const Order = mongoose.model('Order', OrderSchema);
export const User  = mongoose.model('User', new mongoose.Schema({
  name:  String,
  email: String,
}));
