/**
 * @model Notification
 * @description Per-user in-app notifications. Socket.io pushes live; this persists them.
 */
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['feedback', 'badge', 'session', 'system'],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    /** Optional deep link for the frontend */
    link: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // e.g. { recordingId }
  },
  { timestamps: true }
);

// Partial index — only unread notifications are indexed for fast unread counts
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
