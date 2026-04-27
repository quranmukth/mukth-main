/**
 * @routes /api/feedback
 */
import { Router } from 'express';
import {
  createFeedback,
  getFeedbackForRecording,
  getTeacherFeedbackHistory,
} from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate, feedbackSchema } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/',
  authorize('teacher', 'admin'),
  validate(feedbackSchema),
  createFeedback
);

router.get('/teacher/history',
  authorize('teacher', 'admin'),
  getTeacherFeedbackHistory
);

router.get('/:recordingId',
  getFeedbackForRecording
);

export default router;
