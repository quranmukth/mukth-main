/**
 * @routes /api/stats
 */
import { Router } from 'express';
import {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
  getStudentAdvice,
} from '../controllers/statsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/student/:id',        getStudentDashboard);
router.get('/student/:id/advice', getStudentAdvice);
router.get('/teacher/:id',        authorize('teacher', 'admin'), getTeacherDashboard);
router.get('/admin',              authorize('admin'), getAdminDashboard);

export default router;
