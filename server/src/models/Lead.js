import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
  },
  curriculum: {
    type: String,
  },
  preferredTime: {
    type: String,
  },
  customPlan: {
    sessions: Number,
    days: Number,
    mins: Number,
    teacher: String,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'enrolled', 'archived'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Lead', LeadSchema);
