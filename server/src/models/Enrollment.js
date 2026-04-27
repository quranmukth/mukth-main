/**
 * @model Enrollment
 * @description Links a student to a halaqa. Denormalized fields speed up lists.
 */
import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    halaqaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Halaqa', required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'dropped'], default: 'active' },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment
EnrollmentSchema.index({ studentId: 1, halaqaId: 1 }, { unique: true });
EnrollmentSchema.index({ halaqaId: 1, status: 1 });
EnrollmentSchema.index({ studentId: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
export default Enrollment;
