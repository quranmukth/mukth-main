/**
 * @middleware authenticate
 * @description Verifies the JWT Bearer token. Attaches req.user (safe profile).
 * Replaces Supabase RLS auth.uid() context.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Confirm user still exists and is active
    const user = await User.findById(decoded.sub).select('-passwordHash -refreshToken').lean();
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }
    if (user.status !== 'active') {
      return next(new AppError('Your account has been suspended. Contact admin.', 403));
    }

    // 4. Attach to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @middleware optionalAuth
 * @description Like authenticate but does not reject missing tokens — used for public routes
 * that show extra data when logged in.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).lean();
    if (user) req.user = user;
    next();
  } catch {
    next(); // silently ignore bad/expired token on optional routes
  }
};
