/**
 * @routes /api/halaqat
 */
import { Router } from 'express';
import {
  listHalaqat,
  getHalaqa,
  createHalaqa,
  updateHalaqa,
  deleteHalaqa,
  enrollStudent,
  unenrollStudent,
} from '../controllers/halaqaController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate, halaqaSchema } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/',    listHalaqat);
router.get('/:id', getHalaqa);
router.post('/',   authorize('admin'), validate(halaqaSchema), createHalaqa);
router.patch('/:id', updateHalaqa);
router.delete('/:id', authorize('admin'), deleteHalaqa);

// Enrollment sub-routes
router.post('/:id/enroll',              authorize('admin'), enrollStudent);
router.delete('/:id/enroll/:studentId', authorize('admin'), unenrollStudent);

export default router;
