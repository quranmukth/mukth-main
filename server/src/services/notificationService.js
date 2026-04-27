/**
 * @service NotificationService
 * @description Create and deliver in-app notifications.
 * Replaces the Postgres trigger `notify_on_feedback()`.
 * Socket.io push is handled here; persistence goes to MongoDB.
 */
import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

// Lazy import to avoid circular dependency: socket is set once server starts
let _io = null;
export const setSocketIo = (io) => { _io = io; };

const NotificationService = {
  /**
   * Create a notification and push it live via Socket.io.
   * @param {string|ObjectId} userId
   * @param {{ title, message, type, link?, meta? }} payload
   */
  create: async (userId, { title, message, type, link, meta } = {}) => {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link,
        meta,
      });

      // Real-time push — student must be in a room named by their userId
      if (_io) {
        _io.to(userId.toString()).emit('notification:new', {
          id: notification._id,
          title,
          message,
          type,
          link,
          meta,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (err) {
      // Notifications are non-critical — log but don't crash
      logger.error(`Failed to create notification for ${userId}: ${err.message}`);
    }
  },

  /**
   * Mark one or all notifications as read.
   * @param {string} userId
   * @param {string|null} notificationId - null = mark all as read
   */
  markRead: async (userId, notificationId = null) => {
    const filter = notificationId
      ? { _id: notificationId, userId }
      : { userId, isRead: false };

    return Notification.updateMany(filter, { isRead: true });
  },

  /**
   * Get paginated notifications for a user.
   */
  getForUser: async (userId, { limit = 20, skip = 0 } = {}) => {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  /** Count unread notifications */
  unreadCount: async (userId) => {
    return Notification.countDocuments({ userId, isRead: false });
  },
};

export default NotificationService;
