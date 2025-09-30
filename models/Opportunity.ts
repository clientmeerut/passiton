import mongoose, { Schema } from 'mongoose';

const OpportunitySchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['job', 'internship', 'mentor', 'coaching', 'freelance', 'event']
  },
  location: { type: String, required: true },
  duration: { type: String },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
  deadline: { type: Date },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  userId: { type: Schema.Types.Mixed, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Opportunity =
  mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);