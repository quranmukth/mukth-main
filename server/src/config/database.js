/**
 * @module database
 * @description Standard MongoDB connection manager using Mongoose.
 */
import mongoose from 'mongoose';
import logger from './logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retries = 0;
let isConnecting = false;

/**
 * Connect to MongoDB using the URI from environment variables.
 */
const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('❌ MONGODB_URI is not defined in server/.env');
    isConnecting = false;
    return;
  }

  try {
    logger.info('🔌 Connecting to MongoDB...');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(uri, options);

    retries = 0;
    isConnecting = false;
    logger.info(`✅ Connected to MongoDB: ${conn.connection.host}`);

  } catch (err) {
    isConnecting = false;
    logger.error(`❌ MongoDB connection failed: ${err.message}`);

    if (retries < MAX_RETRIES) {
      retries++;
      logger.warn(`🔄 Retrying (${retries}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('💀 Max retries reached. Server running without database connection.');
    }
  }
};

mongoose.connection.on('disconnected', () => {
  if (!isConnecting && retries < MAX_RETRIES) {
    logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    connectDB();
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received — closing MongoDB connection...`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;
