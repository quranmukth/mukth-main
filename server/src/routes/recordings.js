/**
 * @routes /api/recordings
 */
import { Router } from 'express';
import {
  getUploadUrl,
  createRecording,
  listRecordings,
  getRecording,
  getPlaybackUrl,
  updateStatus,
  deleteRecording,
  analyzeRecording,
} from '../controllers/recordingController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate, recordingMetaSchema, updateStatusSchema } from '../middleware/validate.js';

const router = Router();

// All recording routes require authentication
router.use(authenticate);

router.get('/upload-url', getUploadUrl);
router.post('/',          validate(recordingMetaSchema), createRecording);
router.post('/:id/analyze', analyzeRecording);
router.get('/',           listRecordings);
router.get('/:id',        getRecording);
router.get('/:id/url',    getPlaybackUrl);
router.patch('/:id/status', authorize('teacher', 'admin'), validate(updateStatusSchema), updateStatus);
router.delete('/:id',     deleteRecording);

export default router;
