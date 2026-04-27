/**
 * @module database
 * @description MongoDB connection manager with DoH-based DNS bypass for Egypt.
 *
 * Error classification:
 *   - "Authentication" → wrong username/password or authSource
 *   - "Timeout"        → ISP blocking, wrong host/port, or Atlas Network Access not open
 *   - "Protocol"       → mongodb+srv:// used instead of mongodb://
 */
import mongoose from 'mongoose';
import logger from './logger.js';
import { makeDohLookup, prewarmDohCache } from './dohResolver.js';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

let retries = 0;
let isConnecting = false;

/**
 * Classify a Mongoose/MongoDB error into a human-readable category.
 * @param {Error} err
 * @returns {{ category: string, hint: string }}
 */
const classifyError = (err) => {
  const msg = err.message?.toLowerCase() ?? '';
  const code = err.code;

  // Authentication failures
  if (
    msg.includes('authentication failed') ||
    msg.includes('auth failed') ||
    msg.includes('not authorized') ||
    code === 18
  ) {
    return {
      category: 'AUTHENTICATION',
      hint: 'Wrong username/password OR authSource=admin is incorrect.\n' +
            '  → Verify the Atlas DB user credentials.\n' +
            '  → Confirm the user exists under Atlas → Database Access (not just the project).',
    };
  }

  // Connection / timeout failures (ISP blocking, DNS, firewall)
  if (
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('server selection') ||
    msg.includes('could not connect to any servers') ||
    msg.includes('no servers found') ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND'
  ) {
    return {
      category: 'TIMEOUT / NETWORK BLOCK',
      hint: 'Cannot reach Atlas even after DoH resolution. Possible causes:\n' +
            '  1. Atlas Network Access → add 0.0.0.0/0 in Atlas → Network Access.\n' +
            '  2. Port 27017 blocked → try Atlas connection on port 27017 (standard).\n' +
            '  3. DoH also blocked → your ISP may block port 443 to Google/Cloudflare IPs.\n' +
            '  4. Wrong replica set name → check replicaSet= param matches your Atlas cluster.',
    };
  }

  // SSL / TLS errors
  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate')) {
    return {
      category: 'SSL/TLS',
      hint: 'SSL handshake failed. Ensure ssl=true is in the URI and Node.js ≥ 18.',
    };
  }

  return {
    category: 'UNKNOWN',
    hint: 'Check the full error message above for clues.',
  };
};

/**
 * Connect to MongoDB using DoH-resolved DNS to bypass ISP filtering.
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

  // Egypt-Specific Protocol Enforcement
  if (uri.startsWith('mongodb+srv://')) {
    logger.error('❌ PROTOCOL ERROR: Detected "mongodb+srv://".');
    logger.error('   SRV DNS lookups are blocked by Egyptian ISPs.');
    logger.error('   FIX: In Atlas → Connect → Drivers, choose "Standard connection string" (mongodb://).');
    isConnecting = false;
    return;
  }

  try {
    // Step 1: Pre-warm DoH cache (resolves all shard hostnames via HTTPS port 443)
    await prewarmDohCache(uri);

    // Step 2: Connect with the DoH-based custom lookup injected into the driver
    logger.info('🔌 Connecting to MongoDB via DoH-resolved DNS...');

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS:          45000,
      connectTimeoutMS:         30000,
      // Inject our DoH resolver so the MongoDB driver uses HTTPS-resolved IPs
      lookup: makeDohLookup(),
    };

    const conn = await mongoose.connect(uri, options);

    retries = 0;
    isConnecting = false;
    logger.info(`✅ Connected to MongoDB: ${conn.connection.host}`);

  } catch (err) {
    isConnecting = false;

    const { category, hint } = classifyError(err);

    logger.error(`❌ MongoDB connection failed [${category}]`);
    logger.error(`   Raw error : ${err.message}`);
    logger.error(`   Diagnosis :\n${hint}`);

    if (retries < MAX_RETRIES) {
      retries++;
      logger.warn(`🔄 Retrying (${retries}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('💀 Max retries reached. Server running in degraded mode (no DB).');
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
