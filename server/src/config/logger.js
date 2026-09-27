/**
 * @module logger
 * @description Winston logger — Console-only logging (Serverless & Production safe).
 * Prevents file-system writes (mkdir logs) that crash read-only serverless runtimes (Vercel).
 */
import winston from 'winston';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  )
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
});

export default logger;
