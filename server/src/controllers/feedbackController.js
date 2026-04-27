/**
 * @controller FeedbackController
 * @description Teacher submits a review. Emits Socket.io event to the student.
 * Replaces Supabase trigger `notify_on_feedback` + RLS feedback policies.
 */
import Feedback from '../models/Feedback.js';
import Recording from '../models/Recording.js';
import NotificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIo } from '../socket/index.js';

/**
 * POST /feedback
 * Teacher submits feedback with timestamp markers.
 */
export const createFeedback = async (req, res, next) => {
  try {
    const { recordingId, rating, notes, markers } = req.body;

    // Verify recording exists and is pending
    const recording = await Recording.findById(recordingId);
    if (!recording) return next(new AppError('Recording not found.', 404));
    if (recording.status === 'reviewed') {
      return next(new AppError('This recording has already been reviewed.', 409));
    }

    // Create feedback with denormalized studentId for socket targeting
    const feedback = await Feedback.create({
      recordingId,
      teacherId: req.user._id,
      studentId: recording.studentId,
      rating,
      notes,
      markers,
    });

    // Update recording status to reviewed
    await Recording.findByIdAndUpdate(recordingId, { status: 'reviewed' });

    // ── Replaces Postgres trigger notify_on_feedback() ────────────────────────
    const studentId = recording.studentId.toString();

    // 1. Persist notification in MongoDB
    await NotificationService.create(studentId, {
      title: 'تم استلام ملاحظات جديدة 📝',
      message: 'لقد قام المعلم بمراجعة تسجيلك وإضافة ملاحظات.',
      type: 'feedback',
      link: `/recordings/${recordingId}`,
      meta: { recordingId, feedbackId: feedback._id },
    });

    // 2. Push live Socket.io event directly to the student's room
    const io = getIo();
    if (io) {
      io.to(studentId).emit('feedback:new', {
        feedbackId: feedback._id,
        recordingId,
        rating,
        teacherName: req.user.name,
        createdAt: feedback.createdAt,
      });
    }

    // 3. Notify teachers' review queue (remove item for all connected teachers)
    if (io) {
      io.to(`role:teacher`).emit('queue:reviewed', { recordingId });
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /feedback/:recordingId
 * Students see feedback on their own recording; teachers see all.
 */
export const getFeedbackForRecording = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ recordingId: req.params.recordingId })
      .populate('teacherId', 'name nameEn avatarUrl')
      .lean();

    if (!feedback) return next(new AppError('No feedback found for this recording.', 404));

    // Students can only see their own feedback
    if (
      req.user.role === 'student' &&
      feedback.studentId.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Access denied.', 403));
    }

    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /feedback/teacher/history
 * Teacher's own submitted feedback history.
 */
export const getTeacherFeedbackHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      Feedback.find({ teacherId: req.user._id })
        .populate('recordingId', 'surahName ayahRange createdAt')
        .populate('studentId', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Feedback.countDocuments({ teacherId: req.user._id }),
    ]);

    res.json({ success: true, data: history, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};
