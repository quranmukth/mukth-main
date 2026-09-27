/**
 * @file api/index.js
 * @description Vercel Serverless Function entry point.
 *
 * Vercel routes all /api/* requests here (see vercel.json).
 * We lazily import the Express app and ensure the DB connection
 * is cached across warm invocations (serverless-safe pattern).
 */

// Dynamic import required because the server uses ESM ("type":"module")
// and Vercel Functions need a CommonJS/ESM-compatible handler export.
let appPromise;

const getApp = async () => {
  if (!appPromise) {
    appPromise = import('../server/src/app.js').then(async (mod) => {
      const createApp = mod.default;

      // Ensure DB connection is established (cached on global)
      const { default: connectDB } = await import('../server/src/config/database.js');
      await connectDB();

      return createApp();
    });
  }
  return appPromise;
};

// Vercel expects a default export that is a Node.js HTTP handler
export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
