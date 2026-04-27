/**
 * @routes /api/notifications
 */
import { Router } from 'express';
import NotificationService from '../services/notificationService.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const [notifications, unread] = await Promise.all([
      NotificationService.getForUser(req.user._id, { limit: Number(limit), skip }),
      NotificationService.unreadCount(req.user._id),
    ]);
    res.json({ success: true, data: notifications, meta: { unread } });
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await NotificationService.markRead(req.user._id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await NotificationService.markRead(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
