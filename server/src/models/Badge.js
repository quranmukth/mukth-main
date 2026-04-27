/**
 * @model Badge
 * @description Badge catalog (static reference data). Seeded once at startup.
 * user_badges table is replaced by User.badges[] embedded array.
 */
import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. 'streak_7'
    category: { type: String, required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    description: { type: String },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'legendary'],
      default: 'bronze',
    },
    requirement: { type: Number, required: true },
    type: {
      type: String,
      enum: ['streak', 'juz', 'recording', 'accuracy', 'session'],
      required: true,
    },
  },
  { timestamps: false }
);

const Badge = mongoose.model('Badge', BadgeSchema);
export default Badge;
