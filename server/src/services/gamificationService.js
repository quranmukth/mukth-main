/**
 * @service GamificationService
 * @description Badge award logic. Checks user stats and unlocks badges.
 * Badges are embedded directly in User.badges[] for O(1) dashboard reads.
 * Replaces the user_badges join table.
 */
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import NotificationService from './notificationService.js';
import logger from '../config/logger.js';

// ─── Badge Catalog (seed this to MongoDB via scripts/seed.js) ─────────────────

export const BADGE_CATALOG = [
  { _id: 'streak_3',   type: 'streak',    requirement: 3,   tier: 'bronze',    name: 'ثلاثة أيام',    nameEn: '3-Day Streak',    icon: '🔥', category: 'streaks',    description: 'حافظ على مواظبتك لمدة 3 أيام' },
  { _id: 'streak_7',   type: 'streak',    requirement: 7,   tier: 'silver',    name: 'أسبوع المواظب', nameEn: '7-Day Streak',    icon: '⚡', category: 'streaks',    description: 'أسبوع كامل من التلاوة اليومية' },
  { _id: 'streak_30',  type: 'streak',    requirement: 30,  tier: 'gold',      name: 'المداوم',       nameEn: '30-Day Streak',   icon: '💎', category: 'streaks',    description: 'ثلاثون يوماً متواصلة' },
  { _id: 'streak_100', type: 'streak',    requirement: 100, tier: 'legendary', name: 'الحافظ الأسطوري',nameEn: 'Legendary',      icon: '👑', category: 'streaks',    description: '١٠٠ يوم من المواظبة' },
  { _id: 'rec_10',     type: 'recording', requirement: 10,  tier: 'bronze',    name: 'عشر تلاوات',    nameEn: '10 Recordings',   icon: '🎙️', category: 'recordings', description: 'أرسلت ١٠ تسجيلات للمراجعة' },
  { _id: 'rec_50',     type: 'recording', requirement: 50,  tier: 'silver',    name: 'خمسون تلاوة',   nameEn: '50 Recordings',   icon: '🎤', category: 'recordings', description: 'أرسلت ٥٠ تسجيلاً للمراجعة' },
  { _id: 'juz_1',      type: 'juz',       requirement: 1,   tier: 'bronze',    name: 'أول جزء',       nameEn: 'First Juz',       icon: '📖', category: 'memorization', description: 'أتممت حفظ جزء كامل' },
  { _id: 'juz_5',      type: 'juz',       requirement: 5,   tier: 'silver',    name: 'خمسة أجزاء',   nameEn: 'Five Juz',        icon: '📚', category: 'memorization', description: 'أتممت حفظ خمسة أجزاء' },
  { _id: 'juz_30',     type: 'juz',       requirement: 30,  tier: 'legendary', name: 'حافظ القرآن',   nameEn: 'Full Quran',      icon: '🌟', category: 'memorization', description: 'حفظت القرآن الكريم كاملاً' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hasUnlocked = (user, badgeId) =>
  user.badges.some((b) => b.badgeId === badgeId);

const awardBadge = async (user, badgeId, io) => {
  if (hasUnlocked(user, badgeId)) return false;

  user.badges.push({ badgeId, unlockedAt: new Date() });
  await user.save({ validateBeforeSave: false });

  // Persist notification
  await NotificationService.create(user._id, {
    title: '🏆 شارة جديدة!',
    message: `لقد حصلت على شارة "${badgeId}". أحسنت!`,
    type: 'badge',
    meta: { badgeId },
  });

  // Real-time push if Socket.io instance is provided
  if (io) {
    io.to(user._id.toString()).emit('badge:unlocked', { badgeId });
  }

  logger.info(`Badge "${badgeId}" awarded to ${user._id}`);
  return true;
};

// ─── Service ──────────────────────────────────────────────────────────────────

const GamificationService = {
  /** Check and award streak-based badges */
  checkStreakBadges: async (user, io) => {
    const streak = user.streak.currentStreak;
    const streakBadges = BADGE_CATALOG.filter((b) => b.type === 'streak');

    for (const badge of streakBadges) {
      if (streak >= badge.requirement) {
        await awardBadge(user, badge._id, io);
      }
    }
  },

  /** Check and award recording count badges */
  checkRecordingBadges: async (user, recordingCount, io) => {
    const recBadges = BADGE_CATALOG.filter((b) => b.type === 'recording');
    for (const badge of recBadges) {
      if (recordingCount >= badge.requirement) {
        await awardBadge(user, badge._id, io);
      }
    }
  },

  /** Check and award juz memorization badges */
  checkJuzBadges: async (user, io) => {
    const juzBadges = BADGE_CATALOG.filter((b) => b.type === 'juz');
    for (const badge of juzBadges) {
      if (user.totalJuzMemorized >= badge.requirement) {
        await awardBadge(user, badge._id, io);
      }
    }
  },
};

export default GamificationService;
