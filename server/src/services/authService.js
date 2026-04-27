/**
 * @service AuthService
 * @description Business logic for registration, login, and token lifecycle.
 * Implements the JWT-based auth that replaces Supabase Auth.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// ─── Token Helpers ─────────────────────────────────────────────────────────────

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  nameEn: user.nameEn,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  status: user.status,
  isApproved: user.isApproved,
  streak: user.streak,
  badges: user.badges,
  pagesMemorized: user.pagesMemorized,
  accuracy: user.accuracy,
  joinedAt: user.joinedAt,
});

// ─── Service ──────────────────────────────────────────────────────────────────

const AuthService = {
  /**
   * Register a new user.
   * Teachers are set to isApproved: false until an admin approves them.
   */
  register: async ({ name, nameEn, email, password, phone, role, curriculum }) => {
    // Check uniqueness manually for a friendly error (Mongoose will also throw 11000)
    const existing = await User.findOne({ email }).lean();
    if (existing) throw new AppError('An account with this email already exists.', 409, 'DUPLICATE_FIELD');

    const user = await User.create({
      name,
      nameEn,
      email,
      passwordHash: password, // pre-save hook will hash it
      phone,
      role,
      curriculum,
      isApproved: role === 'teacher' ? false : true,
    });

    logger.info(`New user registered: ${email} (${role})`);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Persist refresh token (hashed in production is recommended; here stored plain for simplicity)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: formatUserResponse(user), accessToken, refreshToken };
  },

  /**
   * Log in with email + password.
   */
  login: async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
    if (!user) throw new AppError('Invalid email or password.', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    if (user.status !== 'active') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // Update last active
    user.lastActiveAt = new Date();
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);
    return { user: formatUserResponse(user), accessToken, refreshToken };
  },

  /**
   * Refresh access token using a valid refresh token.
   */
  refreshTokens: async (token) => {
    if (!token) throw new AppError('Refresh token required.', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await User.findById(decoded.sub).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new AppError('Refresh token is invalid or has been revoked.', 401);
    }

    const accessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  },

  /**
   * Logout — invalidate refresh token server-side.
   */
  logout: async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info(`User logged out: ${userId}`);
  },
};

export default AuthService;
