import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  college: { type: String, required: true },
  email: { type: String, required: true }, // ✅ new
  phone: { type: String, required: true }, // ✅ new
  state: { type: String, required: true }, // ✅ Indian state
  city: { type: String, required: true }, // ✅ Indian city
  userId: { type: Schema.Types.Mixed },
  sold: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
