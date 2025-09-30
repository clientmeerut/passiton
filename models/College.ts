import mongoose, { Schema } from 'mongoose';

const CollegeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  addedBy: {
    type: String,
    required: true
  }, // Email or username of who added it
  verified: {
    type: Boolean,
    default: false
  }, // Admin can verify colleges
  usageCount: {
    type: Number,
    default: 1
  }, // Track how many users selected this college
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster search
CollegeSchema.index({ name: 'text' });

export const College = mongoose.models.College || mongoose.model('College', CollegeSchema);