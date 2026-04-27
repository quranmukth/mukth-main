/**
 * @model User
 * @description Unified auth + profile document.
 * Embeds streak data and badges array for O(1) dashboard reads.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const StreakSchema = new mongoose.Schema(
  {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    freezeAvailable: { type: Boolean, default: true },
    /** { "2025-04-22": true, "2025-04-23": "freeze" } */
    history: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const EmbeddedBadgeSchema = new mongoose.Schema(
  {
    badgeId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main User Schema ─────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    nameEn: { type: String, trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    passwordHash: { type: String, required: [true, 'Password is required'], select: false },
    phone: { type: String },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    avatarUrl: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    curriculum: { type: String },
    isApproved: { type: Boolean, default: true }, // teachers may require admin approval

    // Gamification — embedded for read performance
    streak: { type: StreakSchema, default: () => ({}) },
    badges: { type: [EmbeddedBadgeSchema], default: [] },

    // Stats cached fields (updated server-side)
    pagesMemorized: { type: Number, default: 0 },
    totalJuzMemorized: { type: Number, default: 0 },
    hoursThisWeek: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },

    // Auth tokens
    refreshToken: { type: String, select: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'joinedAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

UserSchema.virtual('currentStreak').get(function () {
  return this.streak?.currentStreak ?? 0;
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ─── Methods ─────────────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Removed redundant email index (handled by unique: true in definition)
UserSchema.index({ role: 1, status: 1 });

const User = mongoose.model('User', UserSchema);
export default User;
