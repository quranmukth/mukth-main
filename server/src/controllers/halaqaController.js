/**
 * @controller HalaqaController
 * @description CRUD for Halaqat.
 */
import Halaqa from '../models/Halaqa.js';
import { AppError } from '../middleware/errorHandler.js';

export const listHalaqat = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = { status: 'active' };
    if (role === 'teacher') filter.teacherId = userId;
    const halaqat = await Halaqa.find(filter).populate('teacherId', 'name nameEn avatarUrl meetLink').lean();
    res.json({ success: true, data: halaqat });
  } catch (err) { next(err); }
};

export const getHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.findById(req.params.id).populate('teacherId', 'name nameEn avatarUrl meetLink').lean();
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
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteHalaqa = async (req, res, next) => {
  try {
    const halaqa = await Halaqa.findByIdAndDelete(req.params.id);
    if (!halaqa) return next(new AppError('Halaqa not found.', 404));
    res.json({ success: true, message: 'Halaqa deleted.' });
  } catch (err) { next(err); }
};

export const enrollStudent = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Enrolled successfully.' });
  } catch (err) { next(err); }
};

export const unenrollStudent = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Student unenrolled.' });
  } catch (err) { next(err); }
};
