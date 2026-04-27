/**
 * @module socket
 * @description Production-hardened Socket.io engine.
 *
 * Production tuning for MENA mobile users (4G/5G):
 *   - pingTimeout: 60s  (long enough for high-latency mobile)
 *   - pingInterval: 25s (keep-alive without flooding)
 *   - maxHttpBufferSize: 1e6 (1MB — audio feedback blobs)
 *   - transports: websocket first, polling fallback
 *
 * CORS: reads FRONTEND_URL from env (comma-separated for multi-domain)
 */
import { Server }  from 'socket.io';
import jwt         from 'jsonwebtoken';
import User        from '../models/User.js';
import logger      from '../config/logger.js';

let _io = null;

export const getIo = () => _io;

export const initSocket = (httpServer) => {
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  _io = new Server(httpServer, {
    // ── Production connection settings ──────────────────────────────────────
    pingTimeout:       60_000,   // 60 s — tolerates slow mobile networks
    pingInterval:      25_000,   // 25 s — keep-alive heartbeat
    maxHttpBufferSize: 1_000_000, // 1 MB
    transports:        ['websocket', 'polling'], // websocket preferred; polling fallback

    // ── CORS ────────────────────────────────────────────────────────────────
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Socket.io CORS: origin "${origin}" not allowed`));
      },
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT authentication middleware ────────────────────────────────────────
  _io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('AUTH_REQUIRED'));

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        return next(new Error(e.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'));
      }

      const user = await User.findById(decoded.sub)
        .select('role status')
        .lean();

      if (!user)              return next(new Error('USER_NOT_FOUND'));
      if (user.status !== 'active') return next(new Error('USER_SUSPENDED'));

      socket.data.userId = decoded.sub;
      socket.data.role   = user.role;
      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);
      next(new Error('AUTH_ERROR'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  _io.on('connection', (socket) => {
    const { userId, role } = socket.data;

    // Personal room → targeted events (feedback, badges, notifications)
    socket.join(userId);
    // Role room → broadcast events (new recording for teachers, etc.)
    socket.join(`role:${role}`);

    logger.debug(`[Socket] + ${userId} (${role}) | id=${socket.id}`);

    // ── Teacher: join a live review session room ──────────────────────────
    socket.on('join:review', (recordingId) => {
      if (role !== 'teacher' && role !== 'admin') return;
      socket.join(`review:${recordingId}`);
      logger.debug(`[Socket] ${userId} joined review:${recordingId}`);
    });

    socket.on('leave:review', (recordingId) => {
      socket.leave(`review:${recordingId}`);
    });

    // ── Ping/pong for custom heartbeat monitoring ─────────────────────────
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb('pong');
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket] - ${userId} | reason=${reason}`);
    });

    socket.on('error', (err) => {
      logger.warn(`[Socket] error for ${userId}: ${err.message}`);
    });
  });

  // ── Adapter stats (useful for monitoring) ────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
      const rooms = _io.sockets.adapter.rooms.size;
      logger.debug(`[Socket] Active rooms: ${rooms}`);
    }, 60_000);
  }

  logger.info('✅ Socket.io initialized (production-hardened)');
  return _io;
};
