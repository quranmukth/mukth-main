/**
 * @model Feedback
 * @description Teacher review for a recording. Markers map from SQL JSONB markers[].
 * Each marker: { time: number (seconds), type: 'tajweed'|'makhraj'|'note', note: string }
 */
import mongoose from 'mongoose';

const MarkerSchema = new mongoose.Schema(
  {
    time: { type: Number, required: true },   // timestamp in seconds
    type: {
      type: String,
      enum: ['tajweed', 'makhraj', 'fluency', 'praise', 'note'],
      default: 'note',
    },
    note: { type: String, required: true },
  },
  { _id: false }
);

const FeedbackSchema = new mongoose.Schema(
  {
    recordingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recording',
      required: true,
      unique: true, // one feedback per recording. Handled by Mongoose internal index.
    },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    /** studentId is denormalized here so Socket.io can target the student directly */
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String },
    markers: { type: [MarkerSchema], default: [] },
  },
  { timestamps: true }
);

// Compound indexes for performant listing
FeedbackSchema.index({ teacherId: 1, createdAt: -1 });
FeedbackSchema.index({ studentId: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;
