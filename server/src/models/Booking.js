import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    curriculum: {
      type: String,
      default: 'حفظ وتثبيت القرآن',
    },
    plan: {
      sessions: { type: Number, default: 8 },
      durationMins: { type: Number, default: 30 },
      label: { type: String, default: 'خطة مخصصة' },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'EGP' },
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    teacherName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    waLink: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate random bookingRef (#MKT-XXXX) if not provided
BookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    this.bookingRef = `#MKT-${randomCode}`;
  }
  next();
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
