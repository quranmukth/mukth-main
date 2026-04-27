/**
 * @middleware authorize
 * @description Role-Based Access Control (RBAC) — replaces Supabase RLS role checks.
 *
 * Usage:
 *   router.get('/admin/users', authenticate, authorize('admin'), handler)
 *   router.post('/feedback', authenticate, authorize('teacher', 'admin'), handler)
 */
import { AppError } from './errorHandler.js';

/**
 * Returns middleware that allows only the specified roles.
 * @param {...string} roles - Allowed roles: 'student' | 'teacher' | 'admin'
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of: [${roles.join(', ')}].`,
          403
        )
      );
    }

    next();
  };

/**
 * @middleware isSelf
 * @description Ensures the authenticated user is operating on their own resource.
 * Admins bypass this check.
 *
 * Usage:
 *   router.get('/users/:id', authenticate, isSelf('id'), handler)
 */
export const isSelf = (paramName = 'id') =>
  (req, res, next) => {
    const targetId = req.params[paramName];
    const isOwner = req.user._id.toString() === targetId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }

    next();
  };
