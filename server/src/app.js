/**
 * @module app
 * @description Production-hardened Express application factory.
 *
 * Security layers (in order):
 *   1. Helmet          — 15 secure HTTP headers
 *   2. CORS            — whitelist-only origins
 *   3. Rate limiting   — brute-force protection on auth + audio routes
 *   4. Compression     — gzip/br responses (critical for MENA mobile users)
 *   5. Body parsing    — 10 KB JSON limit (prevents payload flooding)
 *   6. Mongo sanitize  — strips $ and . from input (NoSQL injection prevention)
 *   7. Morgan          — structured HTTP access logging via Winston
 */
import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import morgan         from 'morgan';
import cookieParser   from 'cookie-parser';
import rateLimit      from 'express-rate-limit';
import compression    from 'compression';
import mongoSanitize  from 'express-mongo-sanitize';
import logger         from './config/logger.js';
import errorHandler   from './middleware/errorHandler.js';

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes         from './routes/auth.js';
import userRoutes         from './routes/users.js';
import halaqatRoutes      from './routes/halaqat.js';
import recordingRoutes    from './routes/recordings.js';
import feedbackRoutes     from './routes/feedback.js';
import statsRoutes        from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';
import healthRoutes       from './routes/health.js';
import sessionRoutes      from './routes/sessions.js';

// ── Allowed origins ───────────────────────────────────────────────────────────
const getAllowedOrigins = () => {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Support comma-separated list for multi-domain setups
  return raw.split(',').map((o) => o.trim());
};

const createApp = () => {
  const app = express();

  // ── 1. Trust proxy (required when behind Railway/Render/Nginx) ────────────
  app.set('trust proxy', 1);

  // ── 2. Helmet — secure HTTP headers ──────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow S3 presigned URL assets
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    })
  );

  // ── 3. CORS ───────────────────────────────────────────────────────────────
  const allowedOrigins = getAllowedOrigins();
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (Postman, server-to-server) in dev
        if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin "${origin}" not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // ── 4. Compression (gzip/brotli) ─────────────────────────────────────────
  // Reduces JSON payload size ~70%. Critical for slow 4G connections in Egypt.
  app.use(
    compression({
      level: 6,                          // balanced speed vs size
      threshold: 1024,                   // only compress responses > 1KB
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    })
  );

  // ── 5. Rate limiting ──────────────────────────────────────────────────────

  /** Global: 200 req / 15 min per IP */
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests — please try again later.' },
    skip: (req) => process.env.NODE_ENV === 'test',
  });

  /** Auth brute-force: 15 attempts / 15 min — locks account-guessing bots */
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts — wait 15 minutes.' },
    skipSuccessfulRequests: true, // only count failed attempts
  });

  /** S3 presigned URL: 60 req / 15 min per IP (prevents URL-farming) */
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { success: false, message: 'Too many upload requests.' },
  });

  app.use(globalLimiter);

  // ── 6. Body parsing ───────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ── 7. NoSQL injection sanitisation ──────────────────────────────────────
  // Strips any key containing '$' or '.' from req.body, req.params, req.query
  app.use(mongoSanitize({ replaceWith: '_', allowDots: false }));

  // ── 8. HTTP access logging ────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
    const morganStream = { write: (msg) => logger.http(msg.trim()) };
    app.use(morgan(morganFormat, { stream: morganStream }));
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api/health',        healthRoutes);
  app.use('/api/auth',          authLimiter, authRoutes);
  app.use('/api/users',         userRoutes);
  app.use('/api/halaqat',       halaqatRoutes);
  app.use('/api/recordings',    uploadLimiter, recordingRoutes);
  app.use('/api/feedback',      feedbackRoutes);
  app.use('/api/stats',         statsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/sessions',      sessionRoutes);

  // ── 404 ───────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
  });

  // ── Global error handler ──────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
