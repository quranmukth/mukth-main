/**
 * @module index
 * @description Server entry point. Bootstraps DB and HTTP server.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import http from 'http';
import createApp    from './app.js';
import connectDB    from './config/database.js';
import ensureAdmin  from './scripts/ensureAdmin.js';
import logger       from './config/logger.js';

const PORT     = process.env.PORT     || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const bootstrap = async () => {
  logger.info(`🏗️  Starting Mukth Server in ${NODE_ENV} mode...`);

  // 1. Connect to MongoDB
  await connectDB();

  // 2. Auto-create first admin if DB has none (idempotent, non-fatal)
  await ensureAdmin();

  // 3. Create Express app
  const app = createApp();

  // 4. Listen
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Mukth server running on port ${PORT} [${NODE_ENV}]`);
  });

  // Unhandled rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    if (err.stack) logger.error(err.stack);
  });
};

bootstrap();

