/**
 * @middleware errorHandler
 * @description Centralized error handler. All errors should be passed via next(err).
 */
import logger from '../config/logger.js';

// ─── Custom Error Class ────────────────────────────────────────────────────────

export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code] - Machine-readable error code for the frontend
   */
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Mongoose & JWT Error Translators ────────────────────────────────────────

const handleMongooseCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleMongooseDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    409,
    'DUPLICATE_FIELD'
  );
};

const handleMongooseValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400, 'VALIDATION_ERROR');
};

// ─── Main Error Handler ───────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Translate Mongoose errors into operational AppErrors
  if (err.name === 'CastError') error = handleMongooseCastError(err);
  if (err.code === 11000) error = handleMongooseDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleMongooseValidationError(err);

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
      stack: err.stack,
      body: req.body,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : 'Internal server error.',
    code: error.code || null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
