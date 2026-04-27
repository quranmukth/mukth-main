/**
 * @routes /api/users
 * Admin user management routes.
 */
import { Router } from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate);

// GET /api/users — admin only
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { role, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    const users = await User.find(filter)
      .select('-passwordHash -refreshToken')
      .sort({ joinedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, meta: { total } });
  } catch (err) { next(err); }
});

// GET /api/users/:id — self or admin
router.get('/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return next(new AppError('Access denied.', 403));
    }
    const user = await User.findById(req.params.id).select('-passwordHash -refreshToken').lean();
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id — self update or admin
router.patch('/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return next(new AppError('Access denied.', 403));
    }
    const allowed = ['name', 'nameEn', 'phone', 'avatarUrl', 'curriculum'];
    if (req.user.role === 'admin') allowed.push('role', 'status', 'isApproved');
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-passwordHash -refreshToken');
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id — admin only
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
});

export default router;
