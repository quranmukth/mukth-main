/**
 * @model Halaqa
 * @description Quran study circle.
 *
 * Uses BOTH embedded studentIds[] and the Enrollment collection:
 *   - studentIds[] → fast "is X enrolled?" check and dashboard counts
 *   - Enrollment collection → full enrollment history, status, timestamps
 *
 * This hybrid mirrors the original SQL (halaqat + enrollments tables)
 * while enabling the simple array access the frontend API expects.
 */
import mongoose from 'mongoose';

const ScheduleSlotSchema = new mongoose.Schema(
  {
    day:      { type: String, required: true },   // 'الأحد' / 'Sunday'
    dayEn:    { type: String },
    time:     { type: String, required: true },   // '19:00'
    duration: { type: Number, default: 60 },      // minutes
  },
  { _id: false }
);

const HalaqaSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Halaqa name is required'], trim: true },
    nameEn:   { type: String, trim: true },

    /** The assigned teacher */
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /** Enrolled student refs — kept in sync with Enrollment collection */
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    curriculum:   { type: String },
    capacity:     { type: Number, default: 8, min: 1, max: 50 },
    status:       { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    schedule:     { type: [ScheduleSlotSchema], default: [] },
    meetingUrl:   { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────

HalaqaSchema.virtual('enrolledCount').get(function () {
  return this.studentIds?.length ?? 0;
});

// ── Indexes ───────────────────────────────────────────────────────────────────

HalaqaSchema.index({ teacherId: 1, status: 1 });
HalaqaSchema.index({ studentIds: 1 });  // fast lookup: "which halaqat is this student in?"

const Halaqa = mongoose.model('Halaqa', HalaqaSchema);
export default Halaqa;
