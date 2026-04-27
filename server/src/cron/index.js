/**
 * @module cron
 * @description Scheduled jobs using node-cron.
 * Replaces time-based logic that was implicit in Supabase/Postgres.
 */
import cron from 'node-cron';
import StreakService from '../services/streakService.js';
import logger from '../config/logger.js';

export const initCronJobs = () => {
  // Run every night at midnight UTC — audit streaks for users who missed a day
  cron.schedule('0 0 * * *', async () => {
    logger.info('[CRON] Running nightly streak audit...');
    try {
      await StreakService.auditAllStreaks();
      logger.info('[CRON] Streak audit complete.');
    } catch (err) {
      logger.error(`[CRON] Streak audit failed: ${err.message}`);
    }
  });

  logger.info('✅ Cron jobs initialized');
};
