/**
 * @controller HalaqaController
 * @description CRUD for Halaqat + Enrollment management.
 */
import Halaqa from '../models/Halaqa.js';
import Enrollment from '../models/Enrollment.js';
import NotificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIo } from '../socket/index.js';

export const listHalaqat = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { status: 'active' };
    if (role === 'teacher') filter.teacherId = userId;
    const halaqat = await Halaqa.find(filter).populate('teacherId', 'name nameEn avatarUrl').lean();
    res.json({ success: true, data: halaqat });
  } catch (err) { next(err); }
};

export const getHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.findById(req.params.id).populate('teacherId', 'name nameEn avatarUrl').lean();
    if (!halaqa) return next(new AppError('Halaqa not found.', 404));
    res.json({ success: true, data: halaqa });
  } catch (err) { next(err); }
};

export const createHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.create(req.body);
    res.status(201).json({ success: true, data: halaqa });
  } catch (err) { next(err); }
};

export const updateHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.findById(req.params.id);
    if (!halaqa) return next(new AppError('Halaqa not found.', 404));
    if (req.user.role !== 'admin' && halaqa.teacherId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }
    const updated = await Halaqa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (req.body.status === 'active') {
      const enrollments = await Enrollment.find({ halaqaId: halaqa._id, status: 'active' }).select('studentId').lean();
      const io = getIo();
      for (const e of enrollments) {
        const sid = e.studentId.toString();
        await NotificationService.create(sid, {
          title: 'بدأت حلقة مباشرة! 🎙️',
          message: 'لقد بدأ المعلم حلقة مباشرة الآن. انضم للمشاركة.',
          type: 'session',
          link: `/sessions`,
        });
        if (io) io.to(sid).emit('session:started', { halaqaId: halaqa._id });
      }
    }
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.findByIdAndDelete(req.params.id);
    if (!halaqa) return next(new AppError('Halaqa not found.', 404));
    await Enrollment.deleteMany({ halaqaId: req.params.id });
    res.json({ success: true, message: 'Halaqa deleted.' });
  } catch (err) { next(err); }
};

export const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const { id: halaqaId } = req.params;
    const enrollment = await Enrollment.create({ studentId, halaqaId });
    await Halaqa.findByIdAndUpdate(halaqaId, { $inc: { enrolledCount: 1 } });
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    if (err.code === 11000) return next(new AppError('Student is already enrolled.', 409));
    next(err);
  }
};

export const unenrollStudent = async (req, res, next) => {
  try {
    const { id: halaqaId, studentId } = req.params;
    await Enrollment.findOneAndDelete({ halaqaId, studentId });
    await Halaqa.findByIdAndUpdate(halaqaId, { $inc: { enrolledCount: -1 } });
    res.json({ success: true, message: 'Student unenrolled.' });
  } catch (err) { next(err); }
};
