/**
 * @model Session
 * @description Live Quranic study session (Google Meet / Zoom link).
 */
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    halqaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Halaqa',
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    meetingUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'finished', 'cancelled'],
      default: 'active',
      index: true,
    },
    startTime: { type: Date, default: Date.now },
    endTime:   { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

SessionSchema.index({ halqaId: 1, status: 1 });

const Session = mongoose.model('Session', SessionSchema);
export default Session;
