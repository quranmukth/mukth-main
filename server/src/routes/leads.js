import express from 'express';
import * as leadController from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route to submit interest
router.post('/', leadController.createLead);

// Protected admin routes
router.use(protect);
router.get('/', leadController.getAllLeads);
router.patch('/:id', leadController.updateLeadStatus);

export default router;
