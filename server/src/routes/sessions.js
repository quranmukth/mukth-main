import { Router } from 'express';
import sessionController from '../controllers/sessionController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/active', sessionController.getActiveSessions);

router.post(
  '/start',
  authorize('teacher', 'admin'),
  sessionController.startSession
);

router.patch(
  '/:id/end',
  authorize('teacher', 'admin'),
  sessionController.endSession
);

export default router;
