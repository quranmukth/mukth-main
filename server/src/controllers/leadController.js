import Lead from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';

export const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    // Only admins should access this
    if (req.user.role !== 'admin') {
      return next(new AppError('Access denied.', 403));
    }

    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });
    if (!lead) return next(new AppError('Lead not found.', 404));

    res.json({
      success: true,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};
