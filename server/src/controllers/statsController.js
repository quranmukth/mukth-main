/**
 * @controller StatsController
 * @description Mongo aggregation & stats endpoints.
 */
import User from '../models/User.js';
import Halaqa from '../models/Halaqa.js';
import Lead from '../models/Lead.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { DAILY_VERSES } from '../data/quranData.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return next(new AppError('Access denied.', 403));
    }

    const user = await User.findById(studentId).select('-passwordHash -refreshToken').lean();
    if (!user) return next(new AppError('Student not found.', 404));

    const verse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];

    res.json({
      success: true,
      data: {
        student: user,
        dailyVerse: verse,
        stats: {
          pagesMemorized: user.pagesMemorized || 0,
          hoursThisWeek: user.hoursThisWeek || 0,
          accuracy: user.accuracy || 0,
          currentStreak: user.streak?.currentStreak ?? 0,
        },
        nextSession: null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacherId = req.params.id;

    if (req.user.role === 'teacher' && req.user._id.toString() !== teacherId) {
      return next(new AppError('Access denied.', 403));
    }

    const halaqat = await Halaqa.find({ teacherId }).lean();
    const students = await User.find({ role: 'student', status: 'active' }).limit(10).lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: students.length,
          totalHalaqat: halaqat.length,
          avgRating: 5.0,
        },
        halaqat,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [userStats, halaqaCount, recentUsers, bookingCount, recentBookings] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Halaqa.countDocuments({ status: 'active' }),
      User.find().sort({ joinedAt: -1 }).limit(5).select('name role joinedAt avatarUrl').lean(),
      Booking.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const roleCounts = userStats.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

    res.json({
      success: true,
      data: {
        totalUsers: Object.values(roleCounts).reduce((a, b) => a + b, 0),
        activeStudents: roleCounts.student ?? 0,
        activeTeachers: roleCounts.teacher ?? 0,
        totalHalaqat: halaqaCount,
        recentActivity: recentUsers,
        totalBookings: bookingCount,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentAdvice = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        advice: 'بناءً على تقدمك الأخير، نوصي بالتركيز على مراجعة الجزء الثلاثين لمدة 15 دقيقة يومياً قبل البدء بحفظ آيات جديدة. استمر على هذا المنوال!',
      },
    });
  } catch (err) {
    next(err);
  }
};
