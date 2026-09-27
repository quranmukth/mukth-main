/**
 * @module ensureAdmin
 * @description Auto-seeder that runs on every cold start.
 *
 * Logic:
 *   1. Check if ANY admin exists in the DB.
 *   2. If yes → do nothing (fast path, one DB query).
 *   3. If no  → create the first admin from env vars and log credentials.
 *
 * Safe to call multiple times — idempotent by design.
 * Called automatically from server/src/index.js after DB connects.
 */
import bcrypt from 'bcryptjs';
import User   from '../models/User.js';
import logger from '../config/logger.js';

const ensureAdmin = async () => {
  try {
    // Fast-path: admin already exists
    const existing = await User.findOne({ role: 'admin' }).select('_id email').lean();
    if (existing) {
      logger.info(`🔐 Admin account exists: ${existing.email}`);
      return;
    }

    // No admin found → create one from env or safe defaults
    const email    = process.env.ADMIN_EMAIL    || 'admin@mukth.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminMukth@2025';
    const name     = process.env.ADMIN_NAME     || 'مشرف النظام';

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      nameEn:        'Super Admin',
      email,
      passwordHash,
      role:          'admin',
      isApproved:    true,
      status:        'active',
    });

    // Log prominently so the operator sees it immediately
    logger.warn('═══════════════════════════════════════════════════');
    logger.warn('🚨  FIRST ADMIN CREATED — change password NOW!');
    logger.warn(`    Email   : ${email}`);
    logger.warn(`    Password: ${password}`);
    logger.warn('    Login at: /login  →  Dashboard → تغيير كلمة المرور');
    logger.warn('═══════════════════════════════════════════════════');

    console.log('\n\x1b[33m══════════════════════════════════════════\x1b[0m');
    console.log('\x1b[31m🚨  FIRST ADMIN ACCOUNT CREATED\x1b[0m');
    console.log(`\x1b[36m    Email   : ${email}\x1b[0m`);
    console.log(`\x1b[36m    Password: ${password}\x1b[0m`);
    console.log('\x1b[33m══════════════════════════════════════════\x1b[0m\n');
  } catch (err) {
    // Non-fatal — server should still start even if this fails
    logger.error(`ensureAdmin failed: ${err.message}`);
  }
};

export default ensureAdmin;
