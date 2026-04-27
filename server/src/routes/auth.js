/**
 * @routes /api/auth
 */
import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import { ensureDbConnected } from '../middleware/dbCheck.js';

const router = Router();

// Registration and Login are wrapped in a DB check to return 503 if Atlas is unreachable
router.post('/register', ensureDbConnected, validate(registerSchema), register);
router.post('/login',    ensureDbConnected, validate(loginSchema),    login);

router.post('/refresh',  refreshToken);
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, getMe);

export default router;
