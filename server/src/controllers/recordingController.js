/**
 * @controller RecordingController
 * @description Handles audio recording upload flow (presigned URL strategy) and CRUD.
 */
import Recording from '../models/Recording.js';
import User from '../models/User.js';
import S3Service from '../services/s3Service.js';
import StreakService from '../services/streakService.js';
import GamificationService from '../services/gamificationService.js';
import NotificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /recordings/upload-url
 * Returns a presigned S3 PUT URL. Client uploads directly — server is never a proxy.
 */
export const getUploadUrl = async (req, res, next) => {
  try {
    const { contentType = 'audio/webm' } = req.query;
    const result = await S3Service.getUploadUrl(req.user._id.toString(), contentType);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /recordings
 * Save recording metadata AFTER the client has uploaded the audio to S3.
 * Also triggers streak update and badge checks.
 */
export const createRecording = async (req, res, next) => {
  try {
    const { surahId, surahName, ayahRange, duration, s3Key } = req.body;

    const recording = await Recording.create({
      studentId: req.user._id,
      surahId,
      surahName,
      ayahRange,
      duration,
      s3Key,
    });

    // Trigger streak update (replaces Postgres trigger)
    await StreakService.handleRecordingSubmission(req.user._id);

    // Check recording count badges
    const recCount = await Recording.countDocuments({ studentId: req.user._id });
    const user = await User.findById(req.user._id).select('badges streak totalJuzMemorized');
    await GamificationService.checkRecordingBadges(user, recCount);

    // Notify teacher (if applicable) via Socket.io is handled in the route
    // after this controller returns — see routes/recordings.js

    res.status(201).json({ success: true, data: recording });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /recordings
 * - Students: their own recordings
 * - Teachers: pending recordings from their enrolled students
 * - Admins: all
 */
export const listRecordings = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    const { status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (role === 'student') {
      filter.studentId = userId;
    } else if (role === 'teacher') {
      // Find students enrolled in this teacher's halaqat
      const { default: Enrollment } = await import('../models/Enrollment.js');
      const { default: Halaqa } = await import('../models/Halaqa.js');
      const halaqat = await Halaqa.find({ teacherId: userId }).select('_id').lean();
      const enrollments = await Enrollment.find({
        halaqaId: { $in: halaqat.map((h) => h._id) },
        status: 'active',
      }).select('studentId').lean();
      const studentIds = [...new Set(enrollments.map((e) => e.studentId.toString()))];
      filter.studentId = { $in: studentIds };
      filter.status = filter.status || 'pending'; // teachers see pending by default
    }

    if (status) filter.status = status;

    const [recordings, total] = await Promise.all([
      Recording.find(filter)
        .populate('studentId', 'name nameEn avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Recording.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: recordings,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /recordings/:id
 */
export const getRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.id)
      .populate('studentId', 'name nameEn avatarUrl')
      .lean();
    if (!recording) return next(new AppError('Recording not found.', 404));

    // Students can only see their own
    if (
      req.user.role === 'student' &&
      recording.studentId._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Access denied.', 403));
    }

    res.json({ success: true, data: recording });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /recordings/:id/url
 * Returns a fresh presigned playback URL. Short-lived — don't cache in DB.
 */
export const getPlaybackUrl = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.id).lean();
    if (!recording) return next(new AppError('Recording not found.', 404));
    if (!recording.s3Key) return next(new AppError('No audio file associated with this recording.', 404));

    // Access control
    if (req.user.role === 'student' && recording.studentId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    const url = await S3Service.getPlaybackUrl(recording.s3Key);
    res.json({ success: true, data: { url, expiresIn: 3600 } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /recordings/:id/status
 * Teachers and admins can update recording status.
 */
export const updateStatus = async (req, res, next) => {
  try {
    const recording = await Recording.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!recording) return next(new AppError('Recording not found.', 404));
    res.json({ success: true, data: recording });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /recordings/:id
 * Owner or admin only — removes DB doc and S3 object.
 */
export const deleteRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) return next(new AppError('Recording not found.', 404));

    if (
      req.user.role !== 'admin' &&
      recording.studentId.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Access denied.', 403));
    }

    if (recording.s3Key) await S3Service.deleteObject(recording.s3Key);
    await recording.deleteOne();

    res.json({ success: true, message: 'Recording deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /recordings/:id/analyze
 * Triggers AI analysis (mocked for now).
 */
export const analyzeRecording = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { surahName, ayahRange } = req.body;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const feedback = {
      score: 85,
      tips: [
        `تحسين مخارج الحروف في سورة ${surahName}`,
        'الانتباه للمدود الطبيعية في الآيات المختارة',
        'مراعاة أحكام الغنة عند النون المشددة',
      ],
    };

    const recording = await Recording.findByIdAndUpdate(
      id,
      { aiFeedback: feedback.tips, aiScore: feedback.score },
      { new: true }
    );

    if (!recording) return next(new AppError('Recording not found.', 404));

    res.json({ success: true, data: { feedback, recording } });
  } catch (err) {
    next(err);
  }
};

