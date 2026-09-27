/**
 * @routes /api/auth
 */
import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import { ensureDbConnected } from '../middleware/dbCheck.js';
import ensureAdmin from '../scripts/ensureAdmin.js';
import User from '../models/User.js';

const router = Router();

// Registration and Login are wrapped in a DB check to return 503 if Atlas is unreachable
router.post('/register', ensureDbConnected, validate(registerSchema), register);
router.post('/login',    ensureDbConnected, validate(loginSchema),    login);

router.post('/refresh',  refreshToken);
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, getMe);

/**
 * GET /api/auth/setup
 * One-time admin bootstrap endpoint.
 * - Returns 200 + message if admin was just created.
 * - Returns 409 if admin already exists (to prevent info leakage, no credentials returned).
 * - Useful as a Vercel health-check trigger after first deploy.
 *
 * Disable or protect this route after the first successful login.
 */
router.get('/setup', ensureDbConnected, async (req, res) => {
  const existing = await User.findOne({ role: 'admin' }).select('email').lean();
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Admin already exists. Login at /login.',
    });
  }
  await ensureAdmin();
  const admin = await User.findOne({ role: 'admin' }).select('email name').lean();
  return res.status(201).json({
    success: true,
    message: '✅ First admin created. Check server logs for credentials.',
    email: admin?.email,
  });
});

export default router;

