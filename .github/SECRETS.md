# Mukth Platform — GitHub Secrets Setup Guide
# Add these in: GitHub repo → Settings → Secrets and Variables → Actions

# ─── Backend (Railway) ────────────────────────────────────────────────────────
# RAILWAY_TOKEN
#   Get from: railway.app → Account Settings → Tokens → Create
#   Used by: deploy-backend job

# ─── Frontend (Vercel) ────────────────────────────────────────────────────────
# VERCEL_TOKEN
#   Get from: vercel.com → Settings → Tokens → Create
# VERCEL_ORG_ID
#   Get from: vercel.com → Team Settings → General → Team ID
# VERCEL_PROJECT_ID
#   Get from: vercel.com → Project → Settings → General → Project ID
# VITE_API_URL
#   Value: https://your-backend.railway.app/api

# ─── Smoke Test ───────────────────────────────────────────────────────────────
# PRODUCTION_API_URL
#   Value: https://your-backend.railway.app/api
# SMOKE_TEST_EMAIL
#   Value: smoketest@mukth-internal.dev  (use a dedicated test account)
# SMOKE_TEST_PASSWORD
#   Value: (strong password for that test account)

# ─── How to generate JWT secrets ─────────────────────────────────────────────
# Run in Node.js REPL:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output → JWT_SECRET in Railway env vars
# Run again   → JWT_REFRESH_SECRET in Railway env vars
