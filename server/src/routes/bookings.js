import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route to place booking & generate waLink
router.post('/', createBooking);

/**
 * GET /api/bookings
 * - Admin → sees all bookings (with optional filter params)
 * - Teacher → can query by teacherId (their own students)
 * - Student → can query by phone (their own bookings)
 * All require authentication.
 */
router.get('/', protect, getBookings);

// Admin-only status update routes
router.patch('/:id', protect, authorize('admin'), updateBookingStatus);
router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;
