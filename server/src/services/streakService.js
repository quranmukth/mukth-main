/**
 * @service StreakService
 * @description Server-side streak logic — replaces the Postgres trigger
 * `handle_recording_streak`. Called every time a student submits a recording.
 *
 * Rules (same as original trigger):
 *   - First recording ever → streak = 1
 *   - Recording on the same day → no change
 *   - Recording the day after last activity → increment
 *   - Gap > 1 day → reset to 1 (unless freeze available)
 */
import User from '../models/User.js';
import GamificationService from './gamificationService.js';
import logger from '../config/logger.js';

const today = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const yesterday = () => {
  const d = today();
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
};

const dateKey = (date) => date.toISOString().slice(0, 10); // 'YYYY-MM-DD'

const StreakService = {
  /**
   * Update the streak for a student after a recording is submitted.
   * @param {string} studentId
   * @returns {object} Updated streak sub-document
   */
  handleRecordingSubmission: async (studentId) => {
    const user = await User.findById(studentId).select('streak badges');
    if (!user) return;

    const streak = user.streak;
    const todayDate = today();
    const todayKey = dateKey(todayDate);

    // Already recorded today — no streak change
    if (
      streak.lastActivityDate &&
      dateKey(new Date(streak.lastActivityDate)) === todayKey
    ) {
      logger.debug(`Streak unchanged for ${studentId} — already active today`);
      return streak;
    }

    const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;

    if (!lastDate) {
      // First ever recording
      streak.currentStreak = 1;
    } else if (dateKey(lastDate) === dateKey(yesterday())) {
      // Consecutive day
      streak.currentStreak += 1;
    } else if (streak.freezeAvailable) {
      // Use freeze — keep streak intact
      streak.currentStreak += 1;
      streak.freezeAvailable = false;
      logger.info(`Streak freeze used for student ${studentId}`);
    } else {
      // Streak broken
      logger.info(`Streak broken for student ${studentId}`);
      streak.currentStreak = 1;
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastActivityDate = todayDate;
    streak.history.set(todayKey, true);

    await user.save({ validateBeforeSave: false });

    // Check for streak-based badge unlocks
    await GamificationService.checkStreakBadges(user);

    logger.debug(`Streak updated for ${studentId}: ${streak.currentStreak} days`);
    return streak;
  },

  /**
   * Cron job helper — run nightly to freeze-mark broken streaks.
   * This replaces the "passive" streak break that would happen in Postgres.
   */
  auditAllStreaks: async () => {
    const cutoff = yesterday();
    const users = await User.find({
      'streak.lastActivityDate': { $lt: cutoff },
      'streak.currentStreak': { $gt: 0 },
    }).select('streak');

    logger.info(`Nightly streak audit — processing ${users.length} users`);

    const bulkOps = users.map((u) => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { 'streak.currentStreak': 0 } },
      },
    }));

    if (bulkOps.length) await User.bulkWrite(bulkOps);
  },
};

export default StreakService;
