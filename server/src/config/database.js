/**
 * @module database
 * @description Serverless-safe MongoDB connection manager using Mongoose.
 *
 * In serverless environments (Vercel), the Node.js process is reused across
 * multiple requests within the same "warm" invocation but is killed and
 * restarted between cold starts. Caching the connection on `global` prevents:
 *   - Redundant connection attempts during warm invocations.
 *   - Exhausting MongoDB Atlas's connection pool.
 */
import mongoose from 'mongoose';
import logger from './logger.js';

// Use a global cache so connection survives across Vercel hot-reloads
if (!global._mongoCache) {
  global._mongoCache = { conn: null, promise: null };
}

const cache = global._mongoCache;

/**
 * Connect to MongoDB using the URI from environment variables.
 * Returns the cached connection if one already exists.
 */
const connectDB = async () => {
  // Return existing live connection immediately
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    const msg = '❌ MONGO_URI is not defined in environment variables';
    logger.error(msg);
    console.error(msg);
    throw new Error(msg);
  }

  // Reuse an in-flight connection promise (prevents race conditions)
  if (!cache.promise) {
    logger.info('🔌 Connecting to MongoDB...');
    console.log('🔌 Connecting to MongoDB...');

    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,          // Limit pool size for serverless
        socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => {
        logger.info(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        console.log(`✅ MongoDB Connected Successfully: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        cache.promise = null; // Allow retry on next invocation
        logger.error(`❌ MongoDB connection failed: ${err.message}`);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};

// Graceful shutdown (only relevant in long-running (non-serverless) mode)
const gracefulShutdown = async (signal) => {
  if (mongoose.connection.readyState !== 0) {
    logger.info(`${signal} received — closing MongoDB connection...`);
    await mongoose.connection.close();
  }
  process.exit(0);
};

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;
