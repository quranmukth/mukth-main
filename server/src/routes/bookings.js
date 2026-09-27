import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route to place booking & generate waLink
router.post('/', createBooking);

// Protected Admin routes
router.get('/', protect, authorize('admin'), getBookings);
router.patch('/:id', protect, authorize('admin'), updateBookingStatus);
router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;
