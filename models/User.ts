import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  collegeIdUrl: { type: String, required: true }, // new
  verified: { type: Boolean, default: false },     // new
  createdAt: { type: Date, default: Date.now },
  mobile: { type: String },                  // new -> optional, editable via card
  collegeName: { type: String },
  isAdmin: { type: Boolean, default: false },      // Add admin field
});


export const User = mongoose.models.User || mongoose.model('User', UserSchema);
