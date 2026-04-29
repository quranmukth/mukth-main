/**
 * @controller StatsController
 * @description MongoDB aggregation pipelines replacing Supabase RPCs.
 * Routes: GET /api/stats/student/:id  |  GET /api/stats/teacher/:id  |  GET /api/stats/admin
 */
import Recording from '../models/Recording.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Halaqa from '../models/Halaqa.js';
import Lead from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';
import { DAILY_VERSES } from '../data/quranData.js';

// ─── Student Dashboard ────────────────────────────────────────────────────────

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Access control — student can only see their own dashboard; teacher/admin can see any
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return next(new AppError('Access denied.', 403));
    }

    const [user, enrollments, recCount] = await Promise.all([
      User.findById(studentId).select('-passwordHash -refreshToken').lean(),
      Enrollment.find({ studentId, status: 'active' })
        .populate({
          path: 'halaqaId',
          select: 'name nameEn schedule meetingUrl teacherId',
          populate: { path: 'teacherId', select: 'name nameEn' },
        })
        .lean(),
      Recording.countDocuments({ studentId }),
    ]);

    if (!user) return next(new AppError('Student not found.', 404));

    // Daily verse (deterministic rotation)
    const verse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];

    // Build next session from first active enrollment schedule
    const firstHalaqa = enrollments[0]?.halaqaId;
    const nextSession = firstHalaqa
      ? {
          teacher: firstHalaqa.teacherId?.name,
          teacherEn: firstHalaqa.teacherId?.nameEn,
          halqa: firstHalaqa.name,
          halqaEn: firstHalaqa.nameEn,
          time: firstHalaqa.schedule?.[0]?.time,
          day: firstHalaqa.schedule?.[0]?.day,
          dayEn: firstHalaqa.schedule?.[0]?.dayEn,
          meetingUrl: firstHalaqa.meetingUrl,
        }
      : null;

    res.json({
      success: true,
      data: {
        student: user,
        dailyVerse: verse,
        stats: {
          pagesMemorized: user.pagesMemorized,
          hoursThisWeek: user.hoursThisWeek,
          accuracy: user.accuracy,
          currentStreak: user.streak?.currentStreak ?? 0,
          totalRecordings: recCount,
        },
        nextSession,
        enrollments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

export const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacherId = req.params.id;

    if (req.user.role === 'teacher' && req.user._id.toString() !== teacherId) {
      return next(new AppError('Access denied.', 403));
    }

    // Get this teacher's halaqat
    const halaqat = await Halaqa.find({ teacherId }).lean();
    const halaqaIds = halaqat.map((h) => h._id);

    // Get enrolled student IDs
    const enrollments = await Enrollment.find({ halaqaId: { $in: halaqaIds }, status: 'active' })
      .select('studentId')
      .lean();
    const studentIds = [...new Set(enrollments.map((e) => e.studentId.toString()))];

    // Aggregation: pending recordings from enrolled students
    const [pendingRecordings, statsAgg, avgRatingAgg] = await Promise.all([
      Recording.find({ studentId: { $in: studentIds }, status: 'pending' })
        .populate('studentId', 'name nameEn avatarUrl streak')
        .sort({ createdAt: -1 })
        .lean(),

      // get_teacher_stats RPC equivalent
      Recording.aggregate([
        { $match: { studentId: { $in: enrollments.map((e) => e.studentId) } } },
        {
          $group: {
            _id: null,
            totalRecordings: { $sum: 1 },
            pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          },
        },
      ]),

      Feedback.aggregate([
        { $match: { teacherId: { $eq: req.user._id } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    const stats = {
      pendingReviews: statsAgg[0]?.pendingCount ?? 0,
      totalStudents: studentIds.length,
      totalHalaqat: halaqat.length,
      avgRating: Math.round((avgRatingAgg[0]?.avgRating ?? 0) * 10) / 10,
    };

    res.json({
      success: true,
      data: {
        stats,
        pendingRecordings,
        halaqat,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [userStats, halaqaCount, recentUsers, monthlyGrowth, leadCount, recentLeads] = await Promise.all([
      // User role counts
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      Halaqa.countDocuments({ status: 'active' }),

      // Recent registrations
      User.find().sort({ joinedAt: -1 }).limit(5).select('name role joinedAt avatarUrl').lean(),

      // Monthly growth (last 6 months)
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$joinedAt' },
              month: { $month: '$joinedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),

      Lead.countDocuments({ status: 'new' }),
      Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
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
        monthlyGrowth: monthlyGrowth.reverse(),
        newLeadsCount: leadCount,
        recentLeads: recentLeads,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/stats/student/:id/advice
 * AI Agent: Generates personalized study advice.
 */
export const getStudentAdvice = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    const advice = {
      advice: 'بناءً على تقدمك الأخير، نوصي بالتركيز على مراجعة الجزء الثلاثين لمدة 15 دقيقة يومياً قبل البدء بحفظ آيات جديدة. استمر على هذا المنوال!',
    };

    res.json({ success: true, data: advice });
  } catch (err) {
    next(err);
  }
};

