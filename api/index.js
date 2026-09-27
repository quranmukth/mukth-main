/**
 * @file api/index.js
 * @description Vercel Serverless Function entry point for Mukth Platform API.
 *
 * Vercel routes all /api/* requests here (see vercel.json).
 * We lazily import the Express app and ensure DB connection and admin seeding
 * are handled safely without crashing cold starts.
 */

let appPromise;

const getApp = async () => {
  if (!appPromise) {
    appPromise = (async () => {
      // 1. Import Express app factory
      const { default: createApp }   = await import('../server/src/app.js');
      const { default: connectDB }   = await import('../server/src/config/database.js');
      const { default: ensureAdmin } = await import('../server/src/scripts/ensureAdmin.js');

      // 2. Initialize DB & Admin Seeder safely
      try {
        await connectDB();
        await ensureAdmin();
      } catch (err) {
        console.error('⚠️ DB / Seeder error during Vercel cold start:', err.message);
      }

      // 3. Return initialized Express app
      return createApp();
    })();
  }
  return appPromise;
};

// Vercel Serverless Function Default Handler
export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('❌ Vercel Serverless Handler Execution Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless Execution Error',
      error: err.message,
    });
  }
}
