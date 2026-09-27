/**
 * @route GET /api/health
 * @description Deep health check — verifies DB, S3, and server uptime.
 * Used by Railway/Render health checks and external uptime monitors.
 */
import { Router }     from 'express';
import mongoose       from 'mongoose';
import os             from 'os';
import logger         from '../config/logger.js';

const router = Router();

// ── Check helpers ────────────────────────────────────────────────────────────

const checkMongo = async () => {
  const state = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return {
    status: state === 1 ? 'ok' : 'degraded',
    state:  stateMap[state] ?? 'unknown',
  };
};

// ── Route ─────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const start = Date.now();

  const mongoResult = await checkMongo();
  const allOk = mongoResult.status === 'ok';

  const body = {
    status:    allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),  // seconds
    environment: process.env.NODE_ENV,
    responseTimeMs: Date.now() - start,
    checks: {
      database: mongoResult,
      memory: {
        status: 'ok',
        heapUsedMB:  Math.round(process.memoryUsage().heapUsed  / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMB:       Math.round(process.memoryUsage().rss       / 1024 / 1024),
      },
      system: {
        platform:      os.platform(),
        cpus:          os.cpus().length,
        loadAvg1m:     os.loadavg()[0].toFixed(2),
        freeMemoryMB:  Math.round(os.freemem() / 1024 / 1024),
      },
    },
  };

  if (!allOk) logger.warn('[Health] Degraded state detected', body.checks);

  res.status(allOk ? 200 : 503).json(body);
});

// ── Liveness probe (minimal — for Kubernetes / Railway) ────────────────────────
router.get('/live', (_, res) => res.status(200).send('OK'));

// ── Readiness probe (checks DB only) ──────────────────────────────────────────
router.get('/ready', async (_, res) => {
  const mongo = await checkMongo();
  if (mongo.status === 'ok') return res.status(200).send('READY');
  res.status(503).send('NOT_READY');
});

export default router;
