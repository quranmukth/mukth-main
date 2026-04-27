/**
 * @controller sessionController
 * @description Logic for starting, ending, and fetching live sessions.
 */
import Session from '../models/Session.js';
import Halaqa from '../models/Halaqa.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIo } from '../socket/index.js';
import logger from '../config/logger.js';

const sessionController = {
  /**
   * Fetch active sessions based on user role and enrollments.
   */
  getActiveSessions: async (req, res) => {
    const { role, _id: userId } = req.user;
    let filter = { status: 'active' };

    if (role === 'student') {
      // Find halaqat where the student is enrolled
      const halaqat = await Halaqa.find({ studentIds: userId }).select('_id').lean();
      const halqaIds = halaqat.map((h) => h._id);
      
      if (halqaIds.length === 0) return res.json({ success: true, data: [] });
      filter.halqaId = { $in: halqaIds };
    } else if (role === 'teacher') {
      filter.teacherId = userId;
    }

    const sessions = await Session.find(filter)
      .populate('halqaId', 'name nameEn')
      .populate('teacherId', 'name nameEn avatarUrl')
      .sort('-startTime')
      .lean();

    res.json({ success: true, data: sessions });
  },

  /**
   * Start a new live session.
   */
  startSession: async (req, res) => {
    const { halqaId } = req.body;
    const teacherId = req.user._id;

    // Verify teacher owns this halqa
    const halqa = await Halaqa.findOne({ _id: halqaId, teacherId }).lean();
    if (!halqa) throw new AppError('Halaqa not found or not owned by you.', 404);

    // End any existing active sessions for this halqa
    await Session.updateMany({ halqaId, status: 'active' }, { status: 'finished', endTime: new Date() });

    // Generate a placeholder meeting URL (in prod, you'd call Google/Zoom API here)
    const meetingUrl = `https://meet.google.com/muk-${Math.random().toString(36).substring(7)}`;

    const session = await Session.create({
      halqaId,
      teacherId,
      meetingUrl,
      status: 'active',
    });

    // Notify students in this halqa via Socket.io
    const io = getIo();
    if (io) {
      // Emit to each student's personal room
      halqa.studentIds.forEach((sid) => {
        io.to(sid.toString()).emit('session:started', {
          sessionId: session._id,
          halqaName: halqa.name,
          meetingUrl,
        });
      });
    }

    logger.info(`Session started for halqa: ${halqa.name} by ${req.user.name}`);

    res.status(201).json({ success: true, data: session });
  },

  /**
   * End a live session.
   */
  endSession: async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user._id;

    const session = await Session.findOneAndUpdate(
      { _id: id, teacherId, status: 'active' },
      { status: 'finished', endTime: new Date() },
      { new: true }
    );

    if (!session) throw new AppError('Active session not found or not owned by you.', 404);

    res.json({ success: true, data: session });
  },
};

export default sessionController;
