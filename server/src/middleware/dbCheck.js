/**
 * @middleware dbCheck
 * @description Ensures MongoDB is connected before proceeding to sensitive routes.
 */
import mongoose from 'mongoose';
import { AppError } from './errorHandler.js';

export const ensureDbConnected = (req, res, next) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError('Database is currently unavailable. Please try again in a few moments.', 503, 'SERVICE_UNAVAILABLE'));
  }
  next();
};
