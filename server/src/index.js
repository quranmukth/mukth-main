/**
 * @module index
 * @description Server entry point. Bootstraps DNS, DB, Socket.io, and HTTP server.
 */
import 'dotenv/config';
import { setServers } from 'node:dns';
import http from 'http';
import createApp from './app.js';
import connectDB from './config/database.js';
import { initSocket } from './socket/index.js';
import { initCronJobs } from './cron/index.js';
import { setSocketIo } from './services/notificationService.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Egypt DNS Bypass Hack ───────────────────────────────────────────────────
// We use both System DNS override (8.8.8.8) and DNS-over-HTTPS (DoH).
try {
  setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  logger.warn('Failed to set custom DNS servers. Falling back to system DNS.');
}

const bootstrap = async () => {
  logger.info(`🏗️  Starting Mukth Server in ${NODE_ENV} mode...`);

  // 1. Attempt MongoDB connection
  connectDB();

  // 2. Create Express app
  const app = createApp();

  // 3. Wrap in HTTP server (required for Socket.io)
  const httpServer = http.createServer(app);

  // 4. Initialize Socket.io
  const io = initSocket(httpServer);

  // 5. Give NotificationService a reference to io
  setSocketIo(io);

  // 6. Start cron jobs
  initCronJobs();

  // 7. Listen
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Mukth server running on port ${PORT} [${NODE_ENV}]`);
    logger.info(`🔌 Socket.io ready`);
  });

  // Unhandled rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    if (err.stack) logger.error(err.stack);
  });
};

bootstrap();
