/**
 * @model Recording
 * @description Student audio submission with embedded feedback array.
 *
 * Design decision (vs. separate Feedback collection):
 *   Feedback is always read together with the recording — embed it.
 *   This gives O(1) retrieval for the student's review page.
 *   The separate Feedback collection still exists for teacher-centric queries.
 *
 * Feedback sub-doc shape maps exactly from the old SQL JSONB markers[]:
 *   { timestamp: seconds, comment: string, tag: 'tajweed'|'makhraj'|... }
 */
import mongoose from 'mongoose';

// ── Embedded feedback item ────────────────────────────────────────────────────

const FeedbackItemSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Number, required: true, min: 0 },   // seconds into the audio
    comment:   { type: String, required: true, maxlength: 500 },
    tag: {
      type: String,
      enum: ['tajweed', 'makhraj', 'fluency', 'praise', 'note'],
      default: 'note',
    },
  },
  { _id: true, timestamps: false }
);

// ── AI feedback sub-doc ───────────────────────────────────────────────────────

const AiFeedbackSchema = new mongoose.Schema(
  {
    summary:     { type: String },
    suggestions: { type: [String], default: [] },
    confidence:  { type: Number, min: 0, max: 1 },
  },
  { _id: false }
);

// ── Main Recording Schema ─────────────────────────────────────────────────────

const RecordingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    halaqaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Halaqa',
    },
    surahId:    { type: Number, required: true },
    surahName:  { type: String, required: true },
    ayahRange:  { type: String, required: true },  // e.g. "1-7"
    duration:   { type: Number, required: true },  // seconds

    /** S3 object key — call GET /recordings/:id/url for a presigned playback URL */
    s3Key:      { type: String },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'needsRedo'],
      default: 'pending',
    },

    /** Embedded feedback timeline — teacher comments with timestamps */
    feedback: { type: [FeedbackItemSchema], default: [] },

    /** Summary rating left by the reviewing teacher */
    rating: { type: Number, min: 1, max: 5 },
    teacherNotes: { type: String, maxlength: 2000 },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:   { type: Date },

    /** AI-generated initial assessment */
    aiFeedback: { type: AiFeedbackSchema, default: null },
    aiScore:    { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────

RecordingSchema.virtual('feedbackCount').get(function () {
  return this.feedback?.length ?? 0;
});

// ── Compound indexes ──────────────────────────────────────────────────────────

RecordingSchema.index({ studentId: 1, createdAt: -1 });
RecordingSchema.index({ halaqaId: 1, status: 1, createdAt: -1 });
RecordingSchema.index({ status: 1, createdAt: -1 });  // teacher pending queue

const Recording = mongoose.model('Recording', RecordingSchema);
export default Recording;
